export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src="/images/logo.png"
            alt="Greg & Co. Logo"
            className={`object-contain ${props.className || 'h-9 w-auto'}`}
        />
    );
}
