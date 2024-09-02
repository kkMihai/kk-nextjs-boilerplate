# 🗝️ You have 2 options to generate your own keys

## 1. Local Method (Safest and Recommended)
If you have openssl installed on your machine,
you can generate your own keys by running the following commands:
```bash
:~$ openssl genrsa -out private.pem 2048
:~$ openssl rsa -in private.pem -pubout -out public.pem
```
Then copy the keys to the ".keys" folder

## 2. Online Method (Not Recommended)
You can use the following website to generate your own keys:

[8gwifi RSA Key Generator](https://8gwifi.org/rsafunctions.jsp)

⚠️ Remember you never know when some can steal your keys over the internet.
I recommend to use this method only for local development and you lazy to use openssl
