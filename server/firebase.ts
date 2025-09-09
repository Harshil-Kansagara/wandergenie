import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
  type: "service_account",
  project_id: "wandergenie-93c45",
  private_key_id: "7dd4714c832da07ef57ec292d12bf0e8fc072aa3",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCT6iKAEiWNGlCx\neLWhG+0N0VPECzF28o0SAdT/ym1l5IcTQHmIhxWffTYmh79G1AEdFolWbJ1rQ/lB\ndAvK498YItC0cKVncc6OHVG0ZH0foUpPyoz0SP4EV1//RFAXcDVhdZ5PRKUibRl7\nY/3O/8SAEXQKb5sprKLnSTbth+Mu/gu/NssbkS2FU1jhBmgpeADAkdPT+FfQTXNA\ntD013AzYO1r797FMxM5/c0TMoicUeZBatLiCQ6koVtX3Y3oczCkjNmGrs6RyKIU4\nUl+RYtgkcw9KCIhFe6rfFBegTmo3wL2+OtouoxAEjKio5KN6HUorDnefqUkZRWdc\n2NQPy/grAgMBAAECggEADzEN6A91Ed/xB7k5Flny5+dm7gykQO46dO4BPWBCCiQF\nh4Gouc/99Yp7pEtu5sxhbOZipqCzLlAl6oYLrAPpZuY0f0POiShUKZ5zRM7JVxVO\nt5E7Ft/kTvfWYTZX74BTyzW0U7neKAICivzDFZ6JRQoF3AiIbChR9uU7IfxB5hKD\nkyGH24VgJW/MLcOIV0zm/87/T9ZGCoPs8U6HMShADeWuhmrIKGNxGInu9lVxDEwD\naC6L7dZGWe/OeMzNkLElnuF6wu9T1eWVbQKPCP14u40Sau1heOO8heK2yCo4d5XB\nXii/z7/xXoK8P1JoKr1FErkbRcS4xXG4VYusH6LZqQKBgQDEUygqzMV0C447OHSN\neg1p5blR+GA1g/o3Qj6aihNxoKXOfgglc8EuY9Zf2FL+ijJUCf7EE9c7nPUPqgDY\nQFTKjiXHk92iQs2MjjO0smFqPkBxw/tk092iwieA+fgu+mWGsjPofb9qCKYE3iZl\ndGt0/zQG2pQVxCjv9jGMvrzfDwKBgQDA3/pHbDl2WsZ2LYtFQo6E4FKWqwq7Y5CG\nrpKFgv7VU28yC7YEv4Je9UZGMcsOJ7uDgW7Kd2Q+YCHm1eANGGrOgyXDCfNXN9va\nVGTf6AAIWaxcLtlvukpX66mWRia+ASRCWJVDv0ZqXnp7s/l6pClW5u5Bf+aqaEyW\nKNl+pJSVJQKBgC0vppMTRm8LKdVfjRPy/5tcEGdZb2th0Ple+eG/3fHNM9xvDZjx\nJ4lx2Sl+NLv5OtQ06Lpghq1l1tGgI0mipOFqDi/9TInILl8na6cvV1SIt3R30yjF\nysFnRohdAE5vu2ZhJalhJ+lTzEJajyPSw9jN1D+vl13bJED2vTjTvczpAoGANaOU\nhRxx9ppUKzWLT92sqQOBtGko+Og9n1cZZIwDtuwXNoHPQw7HgQURYCAk6nDeUzpB\nx4jglgBCLWI5hyrNOVV7wPwZcp4URGnIDAUHTUszBgf5bHsQhdcCOMqVp63FmbXs\n/QRK3vYbdh+dOCBDZumeRRT+31FWS0RdCD1ZHQkCgYBDWXLsRpgrTYTcR5u9tsHH\nV6Myp+waUNvPqo4EY/jFEqzeJcB9gG32vStaZMWaVldO5Zy/ZA+4+8QLg77sZsFi\n3R88Y0Xjcp1XylrOS3Nq9Z1LbYxa0wrLIV3duBxmMYqAtIdCuQsuAHqVVlVOwrBw\ngCO50sn1nR1dRTkw07B/3Q==\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-fbsvc@wandergenie-93c45.iam.gserviceaccount.com",
  client_id: "115900121780818863436",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40wandergenie-93c45.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore();
