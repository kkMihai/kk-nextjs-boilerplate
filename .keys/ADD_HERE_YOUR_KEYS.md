# In order for JWT to work, you need to add your own keys to the ".keys" folder.
# you can generate your own keys by running the following commands:
```bash
:~$ openssl genrsa -out private.pem 2048
:~$ openssl rsa -in private.pem -pubout -out public.pem
```

# Then copy the keys to the ".keys" folder