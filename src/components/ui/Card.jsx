import { motion } from 'framer-motion';

export default function Card({ children, className = '', onClick }) {
    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: onClick ? 1.02 : 1 }}
            whileTap={{ scale: onClick ? 0.98 : 1 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-xl p-5 text-zinc-200 shadow-xl ${className}`}
        >
            {children}
        </motion.div>
    );
}
