# Security Specification for Meu Casamento

## 1. Data Invariants
- Each user can only read and write their own wedding document under `/weddings/{userId}` where `userId == request.auth.uid`.
- The `userId` field inside the `/weddings/{userId}` document must strictly match `request.auth.uid`.
- Unauthenticated access is denied for all Firestore operations.
- Default deny all other paths (`/{document=**}`).

## 2. Dirty Dozen Security Payloads
1. **Unauthenticated Read**: Attempt `get` or `list` on `/weddings/user123` without auth token -> MUST REJECT.
2. **Cross-User Read**: Auth user `userA` attempts `get` on `/weddings/userB` -> MUST REJECT.
3. **Cross-User Write**: Auth user `userA` attempts `setDoc` on `/weddings/userB` -> MUST REJECT.
4. **UserId Spoofing**: Auth user `userA` writes `/weddings/userA` with `{ userId: 'userB' }` -> MUST REJECT.
5. **Junk Character ID Attack**: Auth user attempts write to `/weddings/$$$INVALID_ID$$$` -> MUST REJECT.
6. **Oversized String Injection**: Payload with vendor name over 200 characters -> MUST REJECT.
7. **Invalid Pricing Type**: Payload with `pricingType: 'invalid_type'` -> MUST REJECT.
8. **Negative Base Value Attack**: Attempt to inject non-number or malicious value -> MUST REJECT.
9. **Missing Required Field**: Payload missing `config` or `userId` -> MUST REJECT.
10. **Shadow Key Injection**: Payload adding unknown field `isAdmin: true` -> MUST REJECT.
11. **Unverified Email Attack**: User with unverified email attempts write when verification is required -> MUST REJECT (if enabled).
12. **Blanket Query Scraping**: Attempting a `list` query across `/weddings` without filtering by `userId == request.auth.uid` -> MUST REJECT.
