import os
import hmac
import hashlib
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_scheme = HTTPBearer(auto_error=False)

class ProductionSecurityShield:
    def __init__(self):
        self.secret_key = os.getenv("INTERNAL_API_SECRET", "fallback-dev-key-string-32-chars!!")
        self.enforce_auth = os.getenv("AUTH_ENFORCED", "true").lower() == "true"

    async def verify_internal_access(self, request: Request, credentials: HTTPAuthorizationCredentials = Security(security_scheme)):
        client_host = request.client.host if request.client else "127.0.0.1"
        if client_host in ("127.0.0.1", "localhost", "::1") and not self.enforce_auth:
            return True
        if not credentials:
            raise HTTPException(status_code=401, detail="Secure signature credentials missing.")
        if not hmac.compare_digest(hashlib.sha256(credentials.credentials.encode()).hexdigest(), hashlib.sha256(self.secret_key.encode()).hexdigest()):
            raise HTTPException(status_code=403, detail="Signature invalid or expired token context.")
        return True

shield = ProductionSecurityShield()
