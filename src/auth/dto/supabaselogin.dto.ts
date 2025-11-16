import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

/**
 * Supabase 로그인 요청 DTO
 * 클라이언트에서 Supabase를 통해 인증받은 액세스 토큰으로 서버에 로그인합니다.
 */
export default class SupabaseLoginDto {
    @ApiProperty({
        description: '클라이언트에서 Supabase 인증 후 받은 액세스 토큰. 이 토큰으로 사용자 정보를 검증합니다.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    accessToken: string;
}
