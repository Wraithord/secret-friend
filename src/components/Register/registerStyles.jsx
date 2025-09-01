export const registerStyles = {
    container: {
        marginTop: "80px",
        display: "flex",
        justifyContent: "center",
    },
    paper: {
        padding: "40px",
        borderRadius: "16px",
        textAlign: "center",
        background: "linear-gradient(135deg, #ffffff, #e3f2fd)",
        boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "500px",
    },
    title: {
        fontWeight: "bold",
        color: "#1976d2",
        marginBottom: "24px",
    },
    inputWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    icon: {
        color: "#1976d2",
        fontSize: "2rem",
    },
    button: {
        padding: "16px",
        borderRadius: "12px",
        textTransform: "none",
        fontWeight: "bold",
        background: "linear-gradient(90deg, #1976d2, #42a5f5)",
        "&:hover": {
            background: "linear-gradient(90deg, #1565c0, #1e88e5)",
        },
    },
};
