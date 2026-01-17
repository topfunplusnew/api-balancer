docker run -d \
  --name redis \
  --restart unless-stopped \
  -p 36379:6379 \
  -v ./redis-data:/data \
  redis:7.2 \
  redis-server \
  --appendonly yes \
