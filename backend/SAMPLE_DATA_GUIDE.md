# Database Sample Data Management

Hệ thống tự động tạo dữ liệu giả khi khởi động Docker, giúp team có môi trường test nhất quán.

## Cách sử dụng

### 1. Mặc định (có sample data)
```bash
cd backend && docker compose up --build -d
```
Tự động tạo:
- 11,000+ sách từ CSV
- Categories đầy đủ  
- 5 sample vouchers
- 3 test users (admin/customer/staff)

### 2. Không cần sample data
```bash
cd backend && LOAD_SAMPLE_DATA=false docker compose up --build -d
```
Chỉ tạo:
- Database schema
- Basic users

### 3. Cấu hình trong .env
```bash
# Copy và edit .env file
cp .env.example .env

# Edit file .env
LOAD_SAMPLE_DATA=true   # hoặc false
```

## Dữ liệu được tạo

| Loại | Số lượng | Nguồn |
|------|----------|-------|
| Categories | ~500 | `datas/categories.csv` |
| Books | ~11,000 | `datas/data.csv` |
| Vouchers | 5 | Auto-generated |
| Users | 3 | Auto-generated |

### Sample Users
- Admin: `admin@bookstore.com` (role: OWNER)
- Customer: `customer@test.com` (role: CUSTOMER)  
- Staff: `staff@bookstore.com` (role: STAFF)

### Sample Vouchers
- `WELCOME10`: Giảm 10% cho khách mới
- `BOOK50K`: Giảm 50K từ đơn 500K
- `STUDENT15`: Giảm 15% sinh viên
- `FLASH20`: Flash sale 20%
- `EXPIRED`: Voucher hết hạn (test)

## Performance

- Với sample data: 2-3 phút khởi động lần đầu
- Không sample data: 30 giây khởi động
- Lần sau: Fast startup (cache volume)

## Custom Data

### Thêm data riêng
1. Edit `backend/init-scripts/02-seed-data.sh`
2. Thêm SQL commands vào cuối
3. Rebuild: `docker compose up --build -d`

### Reset database
```bash
# Xóa volume và rebuild
docker compose down -v
docker compose up --build -d
```

## Workflow khuyến nghị

### Khi merge code mới:
```bash
# Pull code mới
git checkout develop
git pull origin develop

# Rebuild với sample data
cd backend && docker compose up --build -d
```
Luôn có environment nhất quán để test

### Khi develop feature:
```bash
# Nếu không cần data nhiều
LOAD_SAMPLE_DATA=false docker compose up --build -d

# Hoặc load data một lần rồi develop
docker compose up --build -d  # có data
# develop code...
# restart chỉ app, giữ data
docker compose restart app
```

## Troubleshooting

### Script fails:
```bash
# Check logs
docker logs bookstore_db

# Manual reload
docker exec -it bookstore_db psql -U postgres -d bookstore -c "SELECT COUNT(*) FROM Book;"
```

### Port conflict:
```bash
# Update .env
SERVER_PORT=8081  # hoặc port khác

# Rebuild
docker compose up --build -d
```

### Out of disk space:
```bash
# Clean old volumes
docker system prune -a --volumes
```

---

## Kết luận

Khuyến nghị: Để `LOAD_SAMPLE_DATA=true` khi merge code để team có cùng data test

Lưu ý: Lần đầu chậm hơn nhưng rất tiện cho testing và development