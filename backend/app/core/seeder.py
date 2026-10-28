import logging
from sqlalchemy import select
from app.core.database import async_session_maker
from app.core.security import get_password_hash
from app.models.user import User

logger = logging.getLogger("seeder")

SEED_ACCOUNTS = [
    {
        "email": "admin@system.edu.vn",
        "password": "Admin@123",
        "full_name": "System Administrator",
        "role": "admin",
        "avatar_text": "SA",
        "is_active": True,
    },
    {
        "email": "son.dang@student.edu.vn",
        "password": "Student@123",
        "full_name": "Đặng Quang Sơn",
        "role": "student",
        "avatar_text": "DQ",
        "is_active": True,
    },
    {
        "email": "thang.nguyen@student.edu.vn",
        "password": "Student@123",
        "full_name": "Nguyễn Đỗ Thắng",
        "role": "student",
        "avatar_text": "NT",
        "is_active": True,
    },
    {
        "email": "nhan.vo@student.edu.vn",
        "password": "Student@123",
        "full_name": "Võ Thành Nhân",
        "role": "student",
        "avatar_text": "VN",
        "is_active": False,
    },
    {
        "email": "hoa.le@student.edu.vn",
        "password": "Student@123",
        "full_name": "Lê Thị Hoa",
        "role": "student",
        "avatar_text": "LH",
        "is_active": True,
    },
    {
        "email": "long.tran@student.edu.vn",
        "password": "Student@123",
        "full_name": "Trần Bảo Long",
        "role": "student",
        "avatar_text": "TL",
        "is_active": True,
    },
    {
        "email": "duc.pham@student.edu.vn",
        "password": "Student@123",
        "full_name": "Phạm Minh Đức",
        "role": "student",
        "avatar_text": "MD",
        "is_active": True,
    },
    {
        "email": "phuong.nt@student.edu.vn",
        "password": "Student@123",
        "full_name": "Nguyễn Thu Phương",
        "role": "student",
        "avatar_text": "NP",
        "is_active": False,
    },
    {
        "email": "bao.hoang@student.edu.vn",
        "password": "Student@123",
        "full_name": "Hoàng Gia Bảo",
        "role": "student",
        "avatar_text": "GB",
        "is_active": True,
    },
    {
        "email": "liem.do@student.edu.vn",
        "password": "Student@123",
        "full_name": "Đỗ Thành Liêm",
        "role": "student",
        "avatar_text": "TL",
        "is_active": True,
    },
    {
        "email": "ngoc.cao@student.edu.vn",
        "password": "Student@123",
        "full_name": "Cao Thị Ngọc",
        "role": "student",
        "avatar_text": "TN",
        "is_active": True,
    },
]

async def seed_initial_users():
    """
    Tự động nạp tài khoản mẫu cho hệ thống nếu chưa tồn tại.
    """
    async with async_session_maker() as session:
        try:
            for item in SEED_ACCOUNTS:
                stmt = select(User).where(User.email == item["email"])
                res = await session.execute(stmt)
                existing = res.scalar_one_or_none()
                if not existing:
                    new_user = User(
                        email=item["email"],
                        hashed_password=get_password_hash(item["password"]),
                        full_name=item["full_name"],
                        role=item["role"],
                        avatar_text=item["avatar_text"],
                        is_active=item["is_active"],
                    )
                    session.add(new_user)
                    logger.info(f"Seeded user: {item['email']} ({item['role']})")
                else:
                    # Đảm bảo role và is_active khớp với mock seed
                    if existing.role != item["role"] or existing.is_active != item["is_active"]:
                        existing.role = item["role"]
                        existing.is_active = item["is_active"]
                        existing.avatar_text = item["avatar_text"]
            await session.commit()
        except Exception as e:
            logger.error(f"Error seeding initial users: {e}")
            await session.rollback()
