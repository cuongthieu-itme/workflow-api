# 🛒 E-commerce API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue.svg)](https://www.postgresql.org/)

Hệ thống API.

## 📋 Mục lục

- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt và chạy dự án](#-cài-đặt-và-chạy-dự-án)
- [Cấu hình môi trường](#-cấu-hình-môi-trường)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)


## 🚀 Công nghệ sử dụng

- **Backend Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache & Queue**: Redis + BullMQ
- **Authentication**: JWT
- **Email**: NodeMailer
- **Language**: TypeScript
- **Architecture**: Event-Driven Architecture
- **Containerization**: Docker & Docker Compose

## 🛠️ Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js 18+
- pnpm (hoặc npm/yarn)
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+

### 1. Clone repository

```bash
git clone <repository-url>
cd workflow-api
```

### 2. Cài đặt dependencies

```bash
# Sử dụng pnpm (khuyến nghị)
pnpm install

# Hoặc sử dụng npm
npm install
```

### 3. Cấu hình môi trường

```bash
# Sao chép file env.example thành .env
cp env.example .env

# Chỉnh sửa file .env với thông tin của bạn
nano .env
```

### 4. Khởi động databases với Docker

```bash
# Khởi động PostgreSQL và Redis
docker-compose up -d

# Kiểm tra containers đang chạy
docker ps
```

### 5. Chạy Prisma migrations

```bash
# Tạo database và chạy migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 6. Khởi động ứng dụng

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

Ứng dụng sẽ chạy tại: `http://localhost:8080`
API endpoints: `http://localhost:8080/api`

## ⚙️ Cấu hình môi trường

### Biến môi trường cần thiết

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `APP_PORT` | Port chạy ứng dụng | `8080` |
| `DATABASE_URL` | Kết nối PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `TOKEN_SECRET_KEY` | JWT secret key | `your-secret-key` |
| `MAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USER` | Email username | `your-email@gmail.com` |
| `MAIL_PASSWORD` | Email password | `your-app-password` |

### Cấu hình Email

Để sử dụng Gmail:
1. Bật 2-factor authentication
2. Tạo App Password tại [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Sử dụng App Password làm `MAIL_PASSWORD`

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
```

## 🔧 Scripts có sẵn

```bash
# Development
pnpm run start:dev        # Chạy development mode
pnpm run start:debug      # Chạy debug mode

# Production
pnpm run build            # Build ứng dụng
pnpm run start:prod       # Chạy production mode

# Database
npx prisma migrate dev    # Chạy database migrations
npx prisma studio         # Mở Prisma Studio GUI
npx prisma generate       # Generate Prisma client

# Code quality
pnpm run lint             # Chạy ESLint
pnpm run format           # Format code với Prettier
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

Dự án này sử dụng license [UNLICENSED](LICENSE).

## 📞 Liên hệ

Nếu có bất kỳ câu hỏi nào, vui lòng tạo issue hoặc liên hệ qua email.

---

⭐ **Star repository này nếu bạn thấy hữu ích!**
