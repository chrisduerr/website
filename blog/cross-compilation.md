---
title: AARCH64 Cross-Compilation with Rust
date: Jan 29, 2022
---

Over the past days I've been trying to setup cross-compilation for my Wayland
phone compositor [catacomb](https://github.com/chrisduerr/catacomb). Since it
was written in Rust for my PinePhone, I'm cross-compiling from my x86_64
Archlinux desktop for my aarch64 ALARM phone.

While there are many projects out there using containers, virtual machines, or
emulators to provide a one-stop cross-compilation solution, my goal was to set
this all up without having to install any kind of emulation software.

## Synopsis

For cross-compiling anything that relies on system libraries, one generally
needs three things: A compiler capable of generating code for the target
architecture, a linker, and a set of libraries to compile against.

## The compiler

Since we're using Rust, this step is simple. All we need to do is install the
target with `rustup` using `rustup target add aarch64-unknown-linux-gnu`.

## The linker

With aarch64 on Archlinux, the required toolchain is available in the official
repositories using the `aarch64-linux-gnu-gcc` package. However since the glibc
versions of Archlinux and ALARM can be out of date, it might be necessary to
downgrade this package to the glibc version available in ALARM.

## First success

Once the compiler and linker are setup with matching glibc versions, it should
be possible to cross-compile any Rust program that doesn't link against other
system libraries:

```bash
cargo new hello_world
cd hello_world
RUSTFLAGS="-C linker=aarch64-linux-gnu-gcc" cargo build --target=aarch64-unknown-linux-gnu
```

The executable can then be copied from `target/aarch64-unknown-linux-gnu/` to
the target system and should output `Hello, World!` when invoked.

## The sysroot

While this is enough to build smaller Rust projects, anything linking against
system libraries will fail to compile. For this we need a set of libraries
compatible with our target architecture.

Gentoo's stage3 is probably one of the easiest ways to acquire a minimal Linux
root for several architectures, however this will likely come with a pretty
recent glibc version and make installing new libraries difficult.

If your target is Debian, `debootstrap` is a nice tool available on several
distros which allows downloading a root for your target architecture from the
Debian mirrors.

Since my desktop runs Archlinux, I've decided to install ALARM on my phone to
help with compatibility. Unfortunately, as a result none of these approaches
will work, due to incompatible glibc versions. Instead I've decided to just copy
the necessary files from my phone using [an rsync script](https://github.com/chrisduerr/catacomb/blob/d9d655e54e55d0311719cd1f5255929e63ee4e90/create_sysroot.sh).

This also makes it simple to install all necessary dependencies on the target
machine and then just re-run the script to update the sysroot.

## Linker configuration

To use the sysroot, we need to pass the `--sysroot` flag to our linker, which
can be done by adding `-C link-arg=--sysroot=<SYSROOT_PATH>` to our `RUSTFLAGS`.

Since many projects also make use of `pkgconfig`, we'll have to ensure that it
is using the sysroot by setting the following environment variables:

```bash
PKG_CONFIG_LIBDIR="<SYSROOT_PATH>/usr/lib/pkgconfig:<SYSROOT_PATH>/usr/share/pkgconfig"
PKG_CONFIG_SYSROOT_DIR="<SYSROOT_PATH>"
PKG_CONFIG_ALLOW_CROSS=true
```

Then we can go ahead and build our project. An exemplary buildscript is
available [here](https://github.com/chrisduerr/catacomb/blob/d9d655e54e55d0311719cd1f5255929e63ee4e90/build.sh).

```bash
RUSTFLAGS="-C linker=aarch64-linux-gnu-gcc -C link-arg=--sysroot=<SYSROOT_PATH>" \
    cargo build --target=aarch64-unknown-linux-gnu
```

## Conclusion

While this approach might not work for bigger disparities between host and
target platform, it does work well just compiling for aarch64 without relying on
extra tooling.
