"""
ViewSets for Client and Delivery users.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from ...models import User
from .serializers import (
    UserSerializer, RegisterSerializer, ClientRegisterSerializer, DeliveryRegisterSerializer,
    VerifyOTPSerializer, CustomTokenObtainPairSerializer,
    ResendOTPSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
    VerifyOTPForgotPasswordSerializer, LogoutSerializer
)
from ...domain.services import OTPService
from core.utils import logout_user_tokens
from rest_framework.permissions import IsAuthenticated
from ...decorators.turnstile_required import turnstile_required


class ClientViewSet(viewsets.ViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for CLIENT users.
    Handles registration, authentication, and profile management.
    """

    # Default serializer for Swagger documentation
    serializer_class = ClientRegisterSerializer

    @extend_schema(
        tags=['Client - Authentication'],
        summary='Register new client',
        description='Register a new CLIENT user and send OTP verification code via email',
        request=ClientRegisterSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    @turnstile_required
    def register(self, request):
        """
        Register a new CLIENT user and send OTP.
        POST /api/client/register/
        """
        serializer = ClientRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Force role to CLIENT
            user = serializer.save()
            user.add_role('CLIENT')

            # Generate and send OTP
            otp_code = OTPService.generate_otp()
            user.otp_code = otp_code
            user.otp_created_at = timezone.now()
            user.save()

            OTPService.send_otp_email(
                email=user.email,
                otp_code=otp_code,
                user_name=user.first_name
            )

            return Response({
                'message': 'Registration successful. Please check your email for OTP verification code.',
                'email': user.email
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Registration failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        tags=['Client - Authentication'],
        summary='Verify OTP code',
        description='Verify OTP code to activate client account',
        request=VerifyOTPSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_otp(self, request):
        """
        Verify OTP code to activate user account.
        POST /api/client/verify_otp/
        """
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_verified:
            return Response(
                {'error': 'User already verified'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.otp_code != otp_code:
            return Response(
                {'error': 'Invalid OTP code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not OTPService.is_otp_valid(user.otp_created_at):
            return Response(
                {'error': 'OTP code has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify user
        user.is_verified = True
        user.is_active = True
        user.otp_code = None
        user.otp_created_at = None
        user.save()

        return Response({
            'message': 'Account verified successfully. You can now login.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Client - Authentication'],
        summary='Resend OTP code',
        description='Resend OTP verification code to client email',
        request=ResendOTPSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def resend_otp(self, request):
        """
        Resend OTP code to user's email.
        POST /api/client/resend_otp/
        """
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_verified:
            return Response(
                {'error': 'User already verified'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate new OTP
        otp_code = OTPService.generate_otp()
        user.otp_code = otp_code
        user.otp_created_at = timezone.now()
        user.save()

        # Send OTP
        OTPService.send_otp_email(
            email=user.email,
            otp_code=otp_code,
            user_name=user.first_name
        )

        return Response({
            'message': 'OTP code has been resent to your email.'
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Client - Authentication'],
        summary='Forgot password',
        description='Request password reset OTP code (email or phone)',
        request=ForgotPasswordSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    @turnstile_required
    def forgot_password(self, request):
        """
        Request password reset OTP.
        POST /api/client/forgot_password/
        Body: {"identifier": "email or phone"}
        """
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data['identifier']

        try:
            # Try to find user by email or phone
            if '@' in identifier:
                user = User.objects.get(email=identifier)
            else:
                # TODO: Implement phone verification (send SMS)
                user = User.objects.get(phone=identifier)
                return Response({
                    'message': 'SMS verification not yet implemented. Please use email.'
                }, status=status.HTTP_501_NOT_IMPLEMENTED)
        except User.DoesNotExist:
            # Don't reveal if user exists or not for security
            return Response({
                'message': 'If the account exists, an OTP code has been sent.'
            }, status=status.HTTP_200_OK)

        # Generate OTP for password reset
        otp_code = OTPService.generate_otp()
        user.otp_code = otp_code
        user.otp_created_at = timezone.now()
        user.save()

        # Send OTP via email (password reset template)
        OTPService.send_otp_email(
            email=user.email,
            otp_code=otp_code,
            user_name=user.first_name,
            is_password_reset=True
        )

        return Response({
            'message': 'If the account exists, an OTP code has been sent.',
            'email': user.email  # Return masked email
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Client - Authentication'],
        summary='Verify OTP for forgot password',
        description='Verify OTP code sent for password reset',
        request=VerifyOTPForgotPasswordSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_otp_forgot_password(self, request):
        """
        Verify OTP for forgot password.
        POST /api/client/verify_otp_forgot_password/
        """
        serializer = VerifyOTPForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if OTP matches
        if user.otp_code != otp_code:
            return Response(
                {'error': 'Invalid OTP code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if OTP is expired
        if not OTPService.is_otp_valid(user.otp_created_at):
            return Response(
                {'error': 'OTP code has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'message': 'OTP verified successfully. You can now reset your password.',
            'email': user.email
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Client - Authentication'],
        summary='Resend OTP for forgot password',
        description='Resend OTP code for password reset',
        request=ResendOTPSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def resend_otp_forgot_password(self, request):
        """
        Resend OTP for forgot password.
        POST /api/client/resend_otp_forgot_password/
        """
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if user exists for security
            return Response(
                {'message': 'If the account exists, an OTP code has been sent.'},
                status=status.HTTP_200_OK
            )

        # Generate new OTP
        otp_code = OTPService.generate_otp()
        user.otp_code = otp_code
        user.otp_created_at = timezone.now()
        user.save()

        # Send OTP via email (password reset template)
        OTPService.send_otp_email(
            email=user.email,
            otp_code=otp_code,
            user_name=user.first_name,
            is_password_reset=True
        )

        return Response({
            'message': 'OTP code has been resent to your email.'
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Client - Authentication'],
        summary='Reset password',
        description='Reset password after OTP verification',
        request=ResetPasswordSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def reset_password(self, request):
        """
        Reset password after OTP verification.
        POST /api/client/reset_password/
        """
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Reset password
        user.set_password(new_password)
        user.otp_code = None
        user.otp_created_at = None
        user.save()

        return Response({
            'message': 'Password has been reset successfully. You can now login with your new password.'
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Client - Authentication'],
        summary='Logout client',
        description='Logout and blacklist both access and refresh tokens',
        request=LogoutSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        Logout client and blacklist tokens.
        POST /api/client/logout/
        Body: {"refresh_token": "eyJ0eXAiOiJKV1Qi..."}
        """
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Extract Access Token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        access_token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else None

        # Get Refresh Token from request body
        refresh_token = serializer.validated_data['refresh_token']

        if not access_token:
            return Response(
                {'error': 'Access token not found in Authorization header'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Blacklist both tokens
        result = logout_user_tokens(access_token, refresh_token)

        if result['success']:
            return Response({
                'message': 'Successfully logged out. Both tokens have been blacklisted.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to logout completely',
                'details': result
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeliveryViewSet(viewsets.ViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for DELIVERY users.
    Handles registration, profile management, and location updates.
    """

    # Default serializer for Swagger documentation
    serializer_class = DeliveryRegisterSerializer

    @extend_schema(
        tags=['Delivery - Authentication'],
        summary='Register new delivery person',
        description='Register a new DELIVERY user and send OTP verification code via email',
        request=DeliveryRegisterSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    @turnstile_required
    def register(self, request):
        """
        Register a new DELIVERY user and send OTP.
        POST /api/delivery/register/
        """
        serializer = DeliveryRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Force role to DELIVERY
            user = serializer.save()
            user.add_role('DELIVERY')

            # Create DeliveryPerson profile automatically
            from ...models import DeliveryPerson
            DeliveryPerson.objects.create(
                user=user,
                is_available=True  # Disponible par défaut
            )

            # Generate and send OTP
            otp_code = OTPService.generate_otp()
            user.otp_code = otp_code
            user.otp_created_at = timezone.now()
            user.save()

            OTPService.send_otp_email(
                email=user.email,
                otp_code=otp_code,
                user_name=user.first_name
            )

            return Response({
                'message': 'Registration successful. Please check your email for OTP verification code.',
                'email': user.email
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Registration failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        tags=['Delivery - Authentication'],
        summary='Verify OTP code',
        description='Verify OTP code to activate delivery account',
        request=VerifyOTPSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_otp(self, request):
        """
        Verify OTP code to activate user account.
        POST /api/delivery/verify_otp/
        """
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_verified:
            return Response(
                {'error': 'User already verified'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.otp_code != otp_code:
            return Response(
                {'error': 'Invalid OTP code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not OTPService.is_otp_valid(user.otp_created_at):
            return Response(
                {'error': 'OTP code has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify user
        user.is_verified = True
        user.is_active = True
        user.otp_code = None
        user.otp_created_at = None
        user.save()

        return Response({
            'message': 'Account verified successfully. You can now login.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Delivery - Authentication'],
        summary='Resend OTP code',
        description='Resend OTP verification code to delivery email',
        request=ResendOTPSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def resend_otp(self, request):
        """
        Resend OTP code to user's email.
        POST /api/delivery/resend_otp/
        """
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_verified:
            return Response(
                {'error': 'User already verified'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate new OTP
        otp_code = OTPService.generate_otp()
        user.otp_code = otp_code
        user.otp_created_at = timezone.now()
        user.save()

        # Send OTP
        OTPService.send_otp_email(
            email=user.email,
            otp_code=otp_code,
            user_name=user.first_name
        )

        return Response({
            'message': 'OTP code has been resent to your email.'
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Delivery - Authentication'],
        summary='Forgot password',
        description='Request password reset OTP code (email or phone)',
        request=ForgotPasswordSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    @turnstile_required
    def forgot_password(self, request):
        """
        Request password reset OTP.
        POST /api/delivery/forgot_password/
        Body: {"identifier": "email or phone"}
        """
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data['identifier']

        try:
            # Try to find user by email or phone
            if '@' in identifier:
                user = User.objects.get(email=identifier)
            else:
                # TODO: Implement phone verification (send SMS)
                user = User.objects.get(phone=identifier)
                return Response({
                    'message': 'SMS verification not yet implemented. Please use email.'
                }, status=status.HTTP_501_NOT_IMPLEMENTED)
        except User.DoesNotExist:
            # Don't reveal if user exists or not for security
            return Response({
                'message': 'If the account exists, an OTP code has been sent.'
            }, status=status.HTTP_200_OK)

        # Generate OTP for password reset
        otp_code = OTPService.generate_otp()
        user.otp_code = otp_code
        user.otp_created_at = timezone.now()
        user.save()

        # Send OTP via email (password reset template)
        OTPService.send_otp_email(
            email=user.email,
            otp_code=otp_code,
            user_name=user.first_name,
            is_password_reset=True
        )

        return Response({
            'message': 'If the account exists, an OTP code has been sent.',
            'email': user.email
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Delivery - Authentication'],
        summary='Verify OTP for forgot password',
        description='Verify OTP code sent for password reset',
        request=VerifyOTPForgotPasswordSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_otp_forgot_password(self, request):
        """
        Verify OTP for forgot password.
        POST /api/delivery/verify_otp_forgot_password/
        """
        serializer = VerifyOTPForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if OTP matches
        if user.otp_code != otp_code:
            return Response(
                {'error': 'Invalid OTP code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if OTP is expired
        if not OTPService.is_otp_valid(user.otp_created_at):
            return Response(
                {'error': 'OTP code has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'message': 'OTP verified successfully. You can now reset your password.',
            'email': user.email
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Delivery - Authentication'],
        summary='Resend OTP for forgot password',
        description='Resend OTP code for password reset',
        request=ResendOTPSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def resend_otp_forgot_password(self, request):
        """
        Resend OTP for forgot password.
        POST /api/delivery/resend_otp_forgot_password/
        """
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if user exists for security
            return Response(
                {'message': 'If the account exists, an OTP code has been sent.'},
                status=status.HTTP_200_OK
            )

        # Generate new OTP
        otp_code = OTPService.generate_otp()
        user.otp_code = otp_code
        user.otp_created_at = timezone.now()
        user.save()

        # Send OTP via email (password reset template)
        OTPService.send_otp_email(
            email=user.email,
            otp_code=otp_code,
            user_name=user.first_name,
            is_password_reset=True
        )

        return Response({
            'message': 'OTP code has been resent to your email.'
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Delivery - Authentication'],
        summary='Reset password',
        description='Reset password after OTP verification',
        request=ResetPasswordSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def reset_password(self, request):
        """
        Reset password after OTP verification.
        POST /api/delivery/reset_password/
        """
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Reset password
        user.set_password(new_password)
        user.otp_code = None
        user.otp_created_at = None
        user.save()

        return Response({
            'message': 'Password has been reset successfully. You can now login with your new password.'
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Delivery - Authentication'],
        summary='Logout delivery',
        description='Logout and blacklist both access and refresh tokens',
        request=LogoutSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        Logout delivery and blacklist tokens.
        POST /api/delivery/logout/
        Body: {"refresh_token": "eyJ0eXAiOiJKV1Qi..."}
        """
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Extract Access Token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        access_token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else None

        # Get Refresh Token from request body
        refresh_token = serializer.validated_data['refresh_token']

        if not access_token:
            return Response(
                {'error': 'Access token not found in Authorization header'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Blacklist both tokens
        result = logout_user_tokens(access_token, refresh_token)

        if result['success']:
            return Response({
                'message': 'Successfully logged out. Both tokens have been blacklisted.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to logout completely',
                'details': result
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminViewSet(viewsets.ViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for ADMIN users.
    Handles admin-specific operations and logout.
    """

    # Default serializer for Swagger documentation
    serializer_class = LogoutSerializer

    @extend_schema(
        tags=['Admin - Authentication'],
        summary='Logout admin',
        description='Logout and blacklist both access and refresh tokens',
        request=LogoutSerializer
    )
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        Logout admin and blacklist tokens.
        POST /api/admin/logout/
        Body: {"refresh_token": "eyJ0eXAiOiJKV1Qi..."}
        """
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Extract Access Token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        access_token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else None

        # Get Refresh Token from request body
        refresh_token = serializer.validated_data['refresh_token']

        if not access_token:
            return Response(
                {'error': 'Access token not found in Authorization header'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Blacklist both tokens
        result = logout_user_tokens(access_token, refresh_token)

        if result['success']:
            return Response({
                'message': 'Successfully logged out. Both tokens have been blacklisted.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to logout completely',
                'details': result
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=['Client - Authentication', 'Delivery - Authentication', 'Admin - Authentication'],
    summary='Login (all roles)',
    description='Login with email or phone and password. Returns JWT access and refresh tokens.\n\nBody: {"identifier": "email or phone", "password": "password"}',
    request=CustomTokenObtainPairSerializer
)
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that accepts email or phone as identifier.
    POST /api/login/
    Body: {"identifier": "email or phone", "password": "password"}
    """
    serializer_class = CustomTokenObtainPairSerializer
