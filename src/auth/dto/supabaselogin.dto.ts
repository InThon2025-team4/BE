import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export default class SupabaseLoginDto {
    @ApiProperty({ description: 'Supabase access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @IsNotEmpty()
    @IsString()
    accessToken: string;
}
