import hashlib
import secrets
import string
import hmac

def verify_api_key(user_provided_key, stored_secret_key):
    """
    Verifies an API key against a stored secret.
    Hashes both before comparison to protect memory space.
    """
    user_hash = hashlib.sha256(user_provided_key.encode()).hexdigest()
    stored_hash = hashlib.sha256(stored_secret_key.encode()).hexdigest()
    
    # Check if the hashes match using constant-time comparison to mitigate timing attacks
    if hmac.compare_digest(user_hash, stored_hash):
        return True
        
    return False

def generate_password_reset_token():
    """
    Generates a secure, 32-character random token for password resets.
    """
    alphabet = string.ascii_letters + string.digits
    # Use secrets module for cryptographically secure randomness
    token = ''.join(secrets.choice(alphabet) for i in range(32))
    return token