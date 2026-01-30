"""
Database module.

The hackathon MVP uses purely in-memory processing and does not persist
resumes or evaluations, but this module provides a clean seam for adding
MongoDB or another database later without touching the API layer.
"""

from typing import Any


class DatabaseClient:
    """
    Lightweight placeholder for a future MongoDB client.

    The methods defined here mirror typical CRUD operations so that
    downstream code can be wired up later with minimal changes.
    """

    def __init__(self) -> None:
        # A real implementation would accept connection configuration and
        # establish a client here, e.g. using `motor` or `pymongo`.
        self._connected: bool = False

    async def connect(self) -> None:
        """
        Establish a connection to the database.

        Kept as a no-op for the MVP.
        """

        self._connected = True

    async def disconnect(self) -> None:
        """
        Close the database connection.

        Kept as a no-op for the MVP.
        """

        self._connected = False

    @property
    def is_connected(self) -> bool:
        """
        Expose connection state for health checks or debugging.
        """

        return self._connected

    # Example shapes of future CRUD methods are left intentionally generic
    # and unimplemented so this file remains import-safe in production.

    async def insert_one(self, collection: str, document: dict[str, Any]) -> None:
        """
        Insert a single document into a collection.

        A production implementation would delegate to the underlying
        database driver.
        """

        raise NotImplementedError("Persistent storage is not enabled for this MVP.")


db_client = DatabaseClient()
