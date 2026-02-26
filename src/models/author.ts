import mongoose from 'mongoose';

const AuthorSchema = new mongoose.Schema<IAuthor>({
    name: { type: String, required: true },
    verified: { type: Boolean, required: true },
    plugins: { type: [ String ], required: true }
}, {
    minimize: false,
    versionKey: false
});

const Author = mongoose.model<IAuthor>('Author', AuthorSchema);

export default Author;