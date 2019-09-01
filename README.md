 ![npm](https://img.shields.io/npm/dt/multithread-jwt-cracker.svg)
 [![npm](https://img.shields.io/npm/v/multithread-jwt-cracker.svg)](https://www.npmjs.com/package/multithread-jwt-cracker)
 [![GitHub stars](https://img.shields.io/github/stars/vaverix/multithread-jwt-cracker.svg)](https://github.com/vaverix/multithread-jwt-cracker/stargazers)
 [![GitHub license](https://img.shields.io/github/license/vaverix/multithread-jwt-cracker.svg)](https://github.com/vaverix/multithread-jwt-cracker/blob/master/LICENSE)

# multithread-jwt-cracker

Simple HS256 JWT token brute force cracker with multi-thread support and minimal dependencies. It also shows a resume command on exit and has a nice progressbar.

It is a fork of single-threaded `jwt-cracker` package by @lmammino, check out [the original repo](https://github.com/lmammino/jwt-cracker)!

## Install

With npm:

```bash
npm install --global multithread-jwt-cracker
```

## Usage

From command line:

```bash
multithread-jwt-cracker <token> [<alphabet>] [<maxLength>] [<threads>] [<start>]
```

Where:

* **token**: the full HS256 JWT token string to crack
* **alphabet**: the alphabet to use for the brute force, type 'default' to omit       
(default: "etaoinsrhldcumfpgwybv0123456789kxjqz _-.ETAOINSRHLDCUMFPGWYBVKXJQZ")
* **maxLength**: the max length of the string generated during the brute force (default: 12)
* **threads**: the number of threads to use (default: 1, max: *your-cpu-max-threads*)
* **start**: the index from where to resume the search


## Requirements

This script requires Node.js version 6.0.0 or higher

## Example

Cracking the default [jwt.io example](https://jwt.io):

```bash
multithread-jwt-cracker "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ" "abcdefghijklmnopqrstuwxyz" 6 12
```

It starts cracking with 12 threads and only lower-case letters as alphabet. It takes about 240s to crack on i9-9900K:

```bash
   Cracking process started. (pid: XXXX)
   Token:    <eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ>
   Alphabet: <abcdefghijklmnopqrstuwxyz>
   maxLen:   <6>
   threads:  <12>

[=================   ] length 6/6 | cursor 187,210,000 | 754,879 secrets/sec | elapsed 248s Success!
Secret found! Secret: secret
Time taken (sec): 248

```

Pretty cool, huh?

## Contributing

Everyone is very welcome to contribute to this project.
You can contribute just by submitting bugs or suggesting improvements by
[opening an issue on GitHub](https://github.com/vaverix/multithread-jwt-cracker/issues).

## Future plans

* HTTP server to preview the cracking progress
* Min-length argument
* Looking for a way to optimize this package even more!

## License

Licensed under [MIT License](LICENSE).
