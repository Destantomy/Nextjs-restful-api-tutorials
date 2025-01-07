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
        // initial variables for the search, filtering, and sorting
        const searchKeywords = searchParams.get('keywords') as string;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        // blogs pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

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

        // search blogs api with keywords
        if(searchKeywords) {
            filter.$or = [
                {
                    title: {$regex: searchKeywords, $options: 'i'}
                },
                {
                    description: {$regex: searchKeywords, $options: 'i'}
                }
            ];
        }

        // filter blogs with date
        if(startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if(startDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
            };
        } else if(endDate) {
            filter.createdAt = {
                $lte: new Date(endDate),
            };
        }
        // formula how many blogs had to be skip. ex: 1-10, 11-20 etc.
        const skip = (page - 1) * limit;

        // response for search, filter, and sort
        const blogs = await Blog.find(filter).sort({createdAt: 'asc'}).skip(skip).limit(limit);
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