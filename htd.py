import hashlib
import hmac
import secrets
import string

def verify_api_key(user_provided_key, stored_secret_key):
    """
    Verifies an API key against a stored secret.
    Uses constant-time comparison to prevent timing attacks.
    """
    # Hash both keys using SHA256 to ensure fixed-length comparison 
    # and protect the raw input in memory.
    user_hash = hashlib.sha256(user_provided_key.encode()).hexdigest()
    stored_hash = hashlib.sha256(stored_secret_key.encode()).hexdigest()
    
    # Use hmac.compare_digest for constant-time comparison to prevent timing attacks
    return hmac.compare_digest(user_hash, stored_hash)

def generate_password_reset_token():
    """
    Generates a secure, 32-character random token for password resets
    using cryptographically strong pseudo-random numbers.
    """
    alphabet = string.ascii_letters + string.digits
    # Use secrets module instead of random for cryptographically secure selection
    token = ''.join(secrets.choice(alphabet) for _ in range(32))
    return token