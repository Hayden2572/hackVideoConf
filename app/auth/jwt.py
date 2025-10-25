import json
import base64
from datetime import timedelta, datetime, timezone
import hmac
import hashlib 

SECRET_KEY = "ttTTT-march-tTzTTffff"

class JWT:
    def __init__(self, SECRET_KEY):
        self.SECRET_KEY = SECRET_KEY

    def _base64Encode(self, data: dict) -> str:
        jsonToStr = json.dumps(data)

        return base64.urlsafe_b64encode(jsonToStr.encode()).decode().rstrip("=")
    
    def _base64Decode(self, b64Str: str) -> dict:
        padding = "=" * (-len(b64Str) % 4)

        jsonStr = base64.urlsafe_b64decode(b64Str + padding)
        return json.loads(jsonStr) 
    
    def _sign_message(self, message:str):
        signature = hmac.new(
            self.SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256
            ).digest()
        
        return base64.urlsafe_b64encode(signature).decode().rstrip("=")

    def createAccessToken(self, userID: int, expireMinutes: int = 15) -> str:
        payload = self._base64Encode({
            "sub":userID,
            "exp":int((datetime.now(timezone.utc) + timedelta(minutes=expireMinutes)).timestamp()),
            "type":"access"
        })
        headers = self._base64Encode({
            "alg":"HS256",
            "typ":"JWT"
        })
        
        signature = self._sign_message(f"{headers}.{payload}")

        return f"{headers}.{payload}.{signature}"


    def createRefreshToken(self, userID: int, expireMinutes: int = 7200) -> str:
        payload = self._base64Encode({
            "sub":userID,
            "exp":int((datetime.now(timezone.utc) + timedelta(minutes=expireMinutes)).timestamp()),
            "type":"refresh"
        })
        headers = self._base64Encode({
            "alg":"HS256",
            "typ":"JWT"
        })
        
        signature = self._sign_message(f"{headers}.{payload}")

        return f"{headers}.{payload}.{signature}"
    
    def verifySignature(self, token: str):
        headers, payload, sign = token.split(".")

        exceptedSignature = self._sign_message(f"{headers}.{payload}")
        return hmac.compare_digest(sign, exceptedSignature)
    
    def decodeToken(self, token: str):
        if not self.verifySignature(token=token):
            raise ValueError("Invalid signature")

        _, payload, _ = token.split(".")

        decodedPayload = self._base64Decode(payload)
        
        currentTime = datetime.now(timezone.utc).timestamp()

        if currentTime > decodedPayload["exp"]:
            raise ValueError("token expired")

        return decodedPayload