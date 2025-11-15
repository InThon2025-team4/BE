import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export default class FirebaseLoginDto {
    @ApiProperty({ description: 'Firebase ID token', example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY...' })
    @IsNotEmpty()
    @IsString()
    idToken: string;
}