---
date: 2025-05-01
title: Rust Baremetal
summary: Create a freestanding binary with Rust
categories:
  - Programming
tags:
- rust
- baremetal
---

Most Linux software and libraries rely on the [`GNU C Library`](https://en.wikipedia.org/wiki/GNU_C_Library) (glibc for short). It's a marvel of engineering created by Roland McGrath in 1987 and incorporated into the GNU Project. It's well known for its integration in the [GNU/Linux](https://en.wikipedia.org/wiki/Linux) operating system. As one of the most renowned C libraries (and software libraries), many projects rely on it: operating systems, languages, applications, libraries, etc.

While this is the go-to library in most POSIX-compliant operating systems, it's not always possible to build software that relies on it (directly or under the hood). Such cases include kernels, embedded devices, and more. In these scenarios, you must create a platform-independent binary or library. This approach is known as creating a standalone binary or library — one that can run without relying on a host OS or standard libraries.

In today's post, I'll guide you through creating your own standalone binary in `Rust`!

## Requirements

First, you'll need to install the Rust toolchain manager. It's the default method for installing Rust.

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

This command installs three essential tools: `rustc` (the Rust compiler), `cargo` (Rust’s package manager), and `rustup` (for managing Rust versions and targets).

## Create a New Project

Let's start by creating a new project:

```sh
cargo new standalone_binary
```

You'll see a project layout like this:

```
standalone_binary
├── Cargo.toml
└── src
    └── main.rs
```

If you're building a library, `main.rs` should be `lib.rs`, and specific keys will be found in the `Cargo.toml` manifest.

This setup is typical for Rust, but it still depends on `glibc` for the [standard library](https://doc.rust-lang.org/std/).

## Toolchain Setup

Rust uses the [LLVM Target Triple](https://clang.llvm.org/docs/CrossCompilation.html#target-triple) system in its compilation pipeline.
A good example is `x86_64-unknown-linux-gnu`. This means the compiler builds your software for the [`x86_64` architecture](https://en.wikipedia.org/wiki/X86-64), with no vendor (`unknown`), the GNU/Linux operating system, and a `gnu` environment.

Next, add a bare-metal target to your toolchain:

```sh
rustup target add x86_64-unknown-none
```

You can list installed targets with:

```sh
rustup target list --installed
```

Try compiling the project using the new target:

```sh
cargo build --target x86_64-unknown-none
```

This should produce an error like:

```sh
error[E0463]: can't find crate for `std`
  |
  = note: the `x86_64-unknown-none` target may not support the standard library
  = note: `std` is required by `standalone_binary` because it does not declare `#![no_std]`

error: cannot find macro `println` in this scope
 --> src/main.rs:2:5
  |
2 |     println!("Hello, world!");
  |     ^^^^^^^

error: `#[panic_handler]` function required, but not found

error: requires `sized` lang_item
```

That’s expected — we’re intentionally bypassing the standard Rust setup.

To make things easier, let's set this target as the default so you don't have to specify it every time. Create a `.cargo/config.toml` file:

```sh
mkdir .cargo
touch .cargo/config.toml
```

Add the following content:

```toml
[build]
target = "x86_64-unknown-none"
```

Now you can omit `--target` when building!

## Building

### Error Explanation

The error messages are straightforward. The compiler can't find `println!`, no `panic_handler` function exists, the `Sized` language item is missing, and the `std` crate is required.

That's expected. The `x86_64-unknown-none` target doesn't support the standard library.

You can inspect the metadata of your target:

```sh
rustc --print target-spec-json -Z unstable-options --target x86_64-unknown-none
```

Look for `"std": false` in the metadata section.

### Removing the Standard Library Requirement

At the top of `main.rs`, disable the standard library and remove the `println!` macro:

```rust
#![no_std]

fn main() {
    // nothing for now
}
```

{{< box type="tip" >}}
If you're using an LSP, you'll probably need to configure your `Cargo.toml` like so:

```toml
[[bin]]
name = "standalone_binary"
path = "src/main.rs"
test = false
doctest = false
bench = false
```

This helps avoid issues where the LSP tries to run tests or documentation checks — features that aren’t supported in a `no_std` setup.
{{< /box >}}

### Setting Up `panic_handler`

Now define a basic panic handler in `main.rs`:

```rust
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
```

You can enhance it later to log messages or assist with debugging. See the [Rust Nomicon](https://doc.rust-lang.org/nomicon/panic-handler.html#panic_handler) for details.

{{< box type="tip" >}}
To avoid full panic handling for now, add this to your `Cargo.toml`:

```toml
[profile.dev]
panic = "abort"

[profile.release]
panic = "abort"
```

Even with `abort`, you still need the basic `panic_handler` to satisfy the compiler.
{{< /box >}}

### (Binary-Specific) Setting Up an Entry Point

Rust assumes `main()` is the entry point, but for a bare-metal target, you must define it yourself. Replace `main()` with `_start()`:

```rust
#![no_std]
#![no_main]

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

#[no_mangle]
pub extern "C" fn _start() -> ! {
    loop {}
}
```

- `#![no_main]` disables the automatic `main` entry point.
- `#[no_mangle]` keeps the `_start` name as-is.
- `extern "C"` ensures compatibility with the C ABI.

{{< box type="note" >}}
`_start` is the conventional C-style entry point. Some architectures may require a different name — check their documentation.
{{< /box >}}

## Conclusion

With this setup, you now have a basic freestanding binary or library that doesn’t rely on `std` or `glibc`. It’s a solid foundation for bare-metal or embedded development!
