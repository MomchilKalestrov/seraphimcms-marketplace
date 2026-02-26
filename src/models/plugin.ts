import mongoose from 'mongoose';

const PluginSchema = new mongoose.Schema<IPlugin>({
    name: { type: String, required: true },
    version: { type: String, required: true },
    
    description: { type: String, required: true },
    author: { type: String, required: true }
}, {
    minimize: false,
    versionKey: false
});

const Plugin = mongoose.model<IPlugin>('Plugin', PluginSchema);

export default Plugin;