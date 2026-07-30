# Import the logging library
# Logging is used to record what the system is doing.
# These records help developers monitor the system and debug problems.
import logging


# Configure the logging system
# level=logging.INFO means:
# - The system will record normal important events (INFO)
# - It will also record warnings and errors
# - Very detailed debug messages will NOT be shown
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s | %(levelname)s | %(message)s"
                    )


# Create a logger for our AI agent service
# A logger is like a labeled reporting tool.
# The name "ai-agent" helps identify which service created the log.
logger = logging.getLogger("ai-agent")