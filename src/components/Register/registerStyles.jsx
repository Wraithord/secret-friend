export const registerStyles = {
    container: {
        display: 'flex',
        marginTop: '80px',
        justifyContent: 'center',
    },
    paper: {
        width: '100%',
        padding: '40px',
        maxWidth: '500px',
        textAlign: 'center',
        borderRadius: '16px',
        boxShadow: '0px 6px 20px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #ffffff, #e3f2fd)',
    },
    title: {
        color: '#1976d2',
        fontWeight: 'bold',
        marginBottom: '24px',
    },
    inputWrapper: {
        gap: '12px',
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        color: '#1976d2',
        fontSize: '2rem',
    },
    button: {
        padding: '16px',
        fontWeight: 'bold',
        borderRadius: '12px',
        textTransform: 'none',
        background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
        '&:hover': {
            background: 'linear-gradient(90deg, #1565c0, #1e88e5)',
        },
    },
};
