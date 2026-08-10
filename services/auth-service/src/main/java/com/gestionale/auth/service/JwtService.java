package com.gestionale.auth.service;

import com.gestionale.auth.entity.Operatore;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Gestione dei JWT firmati con HS256. Il segreto viene letto da ENCRYPTION_KEY
 * (stessa variabile del monolite) e normalizzato a 256 bit tramite SHA-256,
 * cosi' funziona anche con chiavi piu' corte.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private static final long ONE_DAY_MS = 86_400_000L;

    public JwtService(@Value("${security.jwt.secret}") String secret) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(secret.getBytes(StandardCharsets.UTF_8));
            this.key = Keys.hmacShaKeyFor(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Impossibile inizializzare la chiave JWT", e);
        }
    }

    public String generateToken(Operatore op) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("IdDip", op.getIdDip());
        claims.put("username", op.getUsername());
        claims.put("ruolo", op.getRuolo());
        claims.put("NomeDip", op.getNomeDip());
        claims.put("CognDip", op.getCognDip());
        return Jwts.builder()
                .claims(claims)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ONE_DAY_MS))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
    }

    public long cookieMaxAgeSeconds() {
        return ONE_DAY_MS / 1000;
    }
}
