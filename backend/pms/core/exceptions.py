"""Custom exception handler for consistent API error responses."""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone


def custom_exception_handler(exc, context):
    """Return consistent error response format."""
    response = exception_handler(exc, context)

    if response is not None:
        error_code = _get_error_code(response.status_code)
        custom_data = {
            'error': {
                'code': error_code,
                'message': _get_error_message(response),
                'details': _get_error_details(response),
            },
            'timestamp': timezone.now().isoformat(),
        }
        response.data = custom_data

    return response


def _get_error_code(status_code):
    code_map = {
        400: 'VALIDATION_ERROR',
        401: 'AUTHENTICATION_ERROR',
        403: 'PERMISSION_DENIED',
        404: 'NOT_FOUND',
        405: 'METHOD_NOT_ALLOWED',
        409: 'CONFLICT',
        429: 'RATE_LIMITED',
        500: 'SERVER_ERROR',
    }
    return code_map.get(status_code, 'UNKNOWN_ERROR')


def _get_error_message(response):
    if isinstance(response.data, dict):
        # Prefer explicit DRF-style "detail" messages (authentication, permission, etc.)
        if 'detail' in response.data:
            return response.data['detail']

        # For validation errors, surface a helpful first field error
        # instead of a generic "An error occurred" message.
        for field, messages in response.data.items():
            # Skip any meta fields, just in case
            if field in {'detail'}:
                continue

            # DRF usually returns a list of messages per field
            if isinstance(messages, (list, tuple)) and messages:
                msg = messages[0]
            else:
                msg = messages

            # If we have a non-empty message, use it
            if msg:
                # For non-field errors, just return the message
                if field == 'non_field_errors':
                    return str(msg)

                # For field errors, include the field name for clarity
                human_field = field.replace('_', ' ').capitalize()
                return f"{human_field}: {msg}"

        # Fallback if we couldn't extract a specific field error
        return 'Validation failed. Please check the input.'

    if isinstance(response.data, list):
        return response.data[0] if response.data else 'An error occurred'
    return str(response.data)


def _get_error_details(response):
    if isinstance(response.data, dict):
        details = []
        for field, messages in response.data.items():
            if field == 'detail':
                continue
            if isinstance(messages, list):
                for msg in messages:
                    details.append({'field': field, 'message': str(msg)})
            else:
                details.append({'field': field, 'message': str(messages)})
        return details if details else None
    return None
