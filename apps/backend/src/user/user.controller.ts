import { Controller, Get, HttpCode, HttpStatus, Post, Version } from '@nestjs/common';

@Controller('users')
export class UserController {
    
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async registerUser() {
        // Logic for user registration
        return { message: 'User registered successfully' };
    }

    //get logged in user
    @Get('me')
    async getLoggedInUser() {
        // Logic to get the logged-in user
        return { message: 'User details retrieved successfully' };
    }

    //get user by id
    @Post(':id')
    async getUserById() {
        // Logic to get user by ID
        return { message: 'User details for the specified ID retrieved successfully' };
    }
}
