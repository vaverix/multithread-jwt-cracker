#!/usr/bin/env node

"use strict";

// Import modules
const cluster = require("cluster");
const crypto = require("crypto");
const bigInt = require("big-integer");
const generator = require("indexed-string-variation").generator;
const ProgressBar = require("progress");
const pkg = require("./package");

// Get cmd vars
const token = process.argv[2];
// Ordered by frequency http://letterfrequency.org/ and discarded some very unusual
const defaultAlphabet =
  "etaoinsrhldcumfpgwybv0123456789kxjqz _-.ETAOINSRHLDCUMFPGWYBVKXJQZ";
const alphabet =
  !process.argv[3] || process.argv[3] == "default"
    ? defaultAlphabet
    : process.argv[3];
const maxLen = Number(process.argv[4]) || 12;
const maxCPUs = require("os").cpus().length;
const numCPUs = Math.min(Math.max(Number(process.argv[5]) || 1, 1), maxCPUs);
const start = Number(process.argv[6]) || 0;
const isValidJWT = token && token.split(".").length === 3;

// Check if the token is provided
if (typeof token === "undefined" || token === "--help" || !isValidJWT) {
  console.log(
    `multithread-jwt-cracker version ${pkg.version}

  Usage:
    multithread-jwt-cracker <token> [<alphabet>] [<maxLength>] [<threads>] [<start>]

    token       the full HS256 jwt token to crack
    alphabet    the alphabet to use for the brute force, type 'default' to omit (default: ${defaultAlphabet})
    maxLength   the max length of the string generated during the brute force (default: 12)
    threads     the number of threads to use (default: 1, max: ${maxCPUs})
    start       the index from where to start the search
`
  );
  process.exit(0);
}

// Initialize variables
const variations = generator(alphabet);
const batchSize = bigInt(String(100000));
const startTime = +new Date();
const [header, payload, signature] = token.split(".");
const content = `${header}.${payload}`;
const startCursor = bigInt(String(start));
let cursor = startCursor;
let len = variations(cursor).length;
let firstTick = true;
let secElapsed = 0;

// TODO: check if there's a faster way to do this
const generateSignature = function(content, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(content)
    .digest("base64")
    .replace("=", "")
    .replace("+", "-")
    .replace("/", "_");
};

// Process current batch of secrets
const processBatch = (batch, cb) => {
  const batchStart = bigInt(batch[0]);
  const batchEnd = bigInt(batch[1]);
  setImmediate(() => {
    for (let i = batchStart; i.lesser(batchEnd); i = i.add(bigInt.one)) {
      // Check current signature
      if (generateSignature(content, variations(i)) == signature) {
        // Secret found!
        return cb(variations(i));
      }
    }
    return cb();
  });
};

// Main thread
if (cluster.isMaster) {
  console.log(`
      Cracking process started. (pid: ${process.pid})
      Token:    <${token}>
      Alphabet: <${alphabet}>
      maxLen:   <${maxLen}>
      threads:  <${numCPUs}>
  `);
  const clusterMap = {};
  for (let i = 0; i < numCPUs; ++i) {
    const customId = i + 100;
    const worker = cluster.fork({ workerId: customId });
    clusterMap[worker.id] = customId;
    worker.on("message", (msg) => {
      switch (msg.type) {
        case "next": {
          const from = cursor;
          const to = cursor.add(batchSize).minus(bigInt.one);
          const batch = [from.toString(), to.toString()];
          cursor = cursor.add(batchSize);
          worker.send({ type: "batch", batch });
          break;
        }
        case "success": {
          console.log(`Secret found! Secret: ${msg.secret}`);
          console.log("Time taken (sec):", secElapsed);
          process.exit(0);
        }
        default:
          console.log("Undefined message: " + JSON.stringify(msg));
      }
    });
  }
  console.log();
  const bar = new ProgressBar(
    "[:bar] length :current/:maxLen | cursor :cursor | :perSec secrets/sec | elapsed :secElapseds ",
    {
      complete: "=",
      incomplete: " ",
      width: 20,
      total: maxLen + 1
    }
  );
  setInterval(() => {
    secElapsed = Math.floor((+new Date() - startTime) / 1000);
    if (len > maxLen) {
      console.log(
        `The cracking process has reached the maximum length, no secret found. Exiting...`
      );
      process.exit();
    }
    const currentLen = variations(cursor).length;
    const cursorPerSec = cursor.subtract(startCursor).divide(secElapsed);
    bar.tick(firstTick ? currentLen : currentLen - len, {
      cursor: cursor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      perSec: cursorPerSec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      secElapsed,
      maxLen
    });
    firstTick = false;
    len = currentLen;
  }, 1000);
  process.on("SIGINT", () => {
    console.log(`

      Cracking interrupted. Resume the process with:

      multithread-jwt-cracker "${token}" "${alphabet}" ${maxLen} ${numCPUs} ${cursor}
    `);
    process.exit();
  });
} else {
  // Child-threads
  process.send({ type: "next" });
  process.on("message", (msg) => {
    if (msg.type === 'batch') {
      processBatch(msg.batch, (pwd) => {
        if (typeof pwd === "undefined") {
          process.send({ type: "next" });
        } else {
          console.log("Success!");
          process.send({ type: "success", secret: pwd });
        }
      });
    }
  });
}

// Catch any exceptions
process.on('uncaughtException', function(err) {
  console.error(err);
});