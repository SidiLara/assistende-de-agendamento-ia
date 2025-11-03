import { AvatarProps } from './Avatar.props';

export const Avatar = ({ src, alt, size, showStatus = false }: AvatarProps) => {
    const wrapperClasses = "relative flex-shrink-0";
    const sizeClasses = size === 'large'
        ? 'w-24 h-24 border-4'
        : 'w-10 h-10';

    const imgClasses = `${sizeClasses} rounded-full object-cover border-white shadow-lg dark:border-dark-tertiary`;

    return (
        <div className={wrapperClasses}>
            <img
                className={imgClasses}
                src={src}
                alt={alt}
            />
            {showStatus && size === 'small' && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-brand-green ring-2 ring-dark-primary"></span>
            )}
        </div>
    );
};
