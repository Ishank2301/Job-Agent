import asyncio
import logging

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models import AutofillSession
from app.services.autofill_engine import AutofillEngine, AutofillState

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def process_pending_session() -> bool:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(AutofillSession)
            .where(AutofillSession.status == AutofillState.PENDING.value)
            .order_by(AutofillSession.created_at.asc())
            .limit(1)
        )

        session = result.scalar_one_or_none()

        if not session:
            return False

        engine = AutofillEngine(db)

        try:
            logger.info("Processing autofill session %s", session.id)
            await engine.run(session)
            await db.commit()
        except Exception:
            logger.exception("Autofill worker failed for session %s", session.id)

            session.status = AutofillState.FAILED.value
            await db.commit()

        return True


async def main() -> None:
    logger.info("Autofill worker started.")

    while True:
        processed = await process_pending_session()

        if not processed:
            await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(main())
