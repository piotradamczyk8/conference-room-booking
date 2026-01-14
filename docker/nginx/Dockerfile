# ============================================
# AI RoomBook - Nginx Dockerfile
# ============================================

FROM nginx:alpine

# Kopiowanie konfiguracji nginx do obrazu
# (rozwiązuje problemy z uprawnieniami na Linux/SELinux)
COPY nginx.conf /etc/nginx/nginx.conf

# Utworzenie katalogu na pliki statyczne
RUN mkdir -p /var/www/html/public

# Expose port 80
EXPOSE 80

# Domyślna komenda
CMD ["nginx", "-g", "daemon off;"]
