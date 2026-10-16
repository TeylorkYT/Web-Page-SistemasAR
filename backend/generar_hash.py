import bcrypt

contrasena = "Prueba123*"
hash_str = bcrypt.hashpw(contrasena.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
print("HASH:", hash_str)
assert bcrypt.checkpw(contrasena.encode("utf-8"), hash_str.encode("utf-8"))
print("VERIFICATION: OK")
