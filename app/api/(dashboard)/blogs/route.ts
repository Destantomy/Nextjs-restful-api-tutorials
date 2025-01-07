import { NextResponse } from 'next/server'
import connect from '@/lib/db';
import Blog from '@/lib/modals/blog';
import User from '@/lib/modals/user';
import Category from '@/lib/modals/category';
import { Types } from 'mongoose';

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const categoryId = searchParams.get('categoryId');

        if(!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({
                    message: 'Invalid or missing user'
                }), {status: 400}
            )
        }

        if(!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(
                JSON.stringify({
                    message: 'Invalid or missing categoryId'
                }), {status: 400}
            );
        }
        
        await connect();
        
        const user = await User.findById(userId);
        if(!user) {
            return new NextResponse(
                JSON.stringify({
                    message: 'User not found'
                }), {status: 404}
            );
        }

        const category = await Category.findById(categoryId);
        if(!category) {
            return new NextResponse(
                JSON.stringify({
                    message: 'Category not found'
                }), {status: 404}
            );
        }

        const filter: any = {
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId),
        };

        const blogs = await Blog.find(filter);
        return new NextResponse(JSON.stringify(blogs), {status: 200});
    } catch (error: any) {
        return new NextResponse('error fetching blog' + error.message, {status:500});
    }
    
}

export const POST = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const categoryId = searchParams.get('categoryId');
        const body = await request.json();
        const { title, description } = body;

        if(!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({
                    message: 'Invalid or missing user'
                }), {status: 400}
            )
        }

        if(!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(
                JSON.stringify({
                    message: 'Invalid or missing categoryId'
                }), {status: 400}
            );
        }
        
        await connect();
        const user = await User.findById(userId);
        if(!user) {
            return new NextResponse(
                JSON.stringify({
                    message: 'User not found'
                }), {status: 404}
            );
        }

        const category = await Category.findById(categoryId);
        if(!category) {
            return new NextResponse(
                JSON.stringify({
                    message: 'Category not found'
                }), {status: 404}
            );
        }

        const newBlog = new Blog({
            title,
            description,
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId)
        })

        await newBlog.save();
        return new NextResponse(JSON.stringify({
            message: 'blog is created successfully',
            blog: newBlog
        }), {status: 201});
    } catch (error: any) {
        return new NextResponse('error creating blog' + error.message, {status: 500});
    }
}