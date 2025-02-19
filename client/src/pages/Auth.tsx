import { useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authServices";
import { RootState } from "../store/store";
import { loginFailure, loginStart, loginSuccess } from "../store/slices/authSlice";
import { motion } from "framer-motion";

// ✅ Define TypeScript types
type LoginFormValues = {
    email: string;
    password: string;
};

// ✅ Zod schema for form validation
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// ✅ Utility function for storing user data
const storeUserData = (token: string, role: string, user: object) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(user));
};

// ✅ Animated Input Field Component
const InputField: React.FC<{
    name: keyof LoginFormValues;
    type: string;
    label: string;
    control: any;
    errors: any;
}> = ({ name, type, label, control, errors }) => (
    <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
        <label htmlFor={name} className="block text-sm font-medium text-white">{label}</label>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <motion.input
                    {...field}
                    id={name}
                    type={type}
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    whileFocus={{ scale: 1.02 }}
                />
            )}
        />
        {errors[name] && <p className="text-red-500 text-sm">{errors[name]?.message}</p>}
    </motion.div>
);

// ✅ Authentication Component
const Auth: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state: RootState) => state.auth);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    // ✅ Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const user = localStorage.getItem("user");

        if (token && role && user) {
            try {
                dispatch(loginSuccess({ token, role, user: JSON.parse(user) }));
                navigate(role === "admin" ? "/admin/dashboard" : "/employee/dashboard", { replace: true });
            } catch (error) {
                console.error("🔴 Error parsing user data:", error);
            }
        }
    }, [dispatch, navigate]);

    // ✅ Handle Login Submission
    const handleLogin = useCallback(async (data: LoginFormValues) => {
        dispatch(loginStart());
        try {
            const response = await loginUser(data);

            if (!response?.token) {
                console.error("❌ Response does not contain a token:", response);
                throw new Error("Invalid response format: Missing token");
            }

            const { token, role, user } = response;

            toast.success("🎉 Login successful!");
            storeUserData(token, role, user);

            dispatch(loginSuccess({ token, role, user }));
            navigate(role === "admin" ? "/admin/dashboard" : "/employee/dashboard", { replace: true });
        } catch (error: any) {
            console.error("🔴 Login Error:", error);
            toast.error(error.response?.data?.message || "Login failed.");
            dispatch(loginFailure());
        }
    }, [dispatch, navigate]);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-r from-gray-900 to-indigo-900 text-white">
            <div className="flex-grow flex justify-center items-center py-6 px-4 md:px-8">
                <motion.div
                    className="bg-gradient-to-l from-gray-900 to-indigo-900 text-white shadow-lg p-8 rounded-lg max-w-lg w-full"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
                    <form onSubmit={handleSubmit(handleLogin)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {useMemo(() => (
                                <>
                                    <InputField name="email" type="email" label="Email" control={control} errors={errors} />
                                    <InputField name="password" type="password" label="Password" control={control} errors={errors} />
                                </>
                            ), [control, errors])}
                        </div>
                        <div className="mb-6">
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2 rounded-lg text-white focus:outline-none relative overflow-hidden"
                                initial={{ backgroundColor: "rgb(59, 130, 246)" }} // bg-blue-500
                                animate={isLoading ? { backgroundColor: "rgb(153, 255, 153)" } : { backgroundColor: "rgb(59, 130, 246)" }} // bg-gray-500 when loading
                                whileHover={!isLoading ? { backgroundColor: "rgb(37, 99, 255)" } : {}} // hover:bg-blue-600
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={isLoading ? { width: "100%" } : { width: "0%" }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-green-500"
                                />
                                <span className="relative z-10">{isLoading ? "Processing..." : "Login"}</span>
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Auth;
