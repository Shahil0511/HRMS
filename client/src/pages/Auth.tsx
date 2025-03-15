import React, { useEffect, useState, useCallback, memo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "../store/store";
import { loginUser } from "../services/authServices";
import { loginStart, loginSuccess, loginFailure } from "../store/slices/authSlice";

// Define types
export type LoginFormValues = {
    email: string;
    password: string;
};

// Zod schema for form validation
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1,
            duration: 0.5
        }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.3 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Memoized Input Field component
const InputField = memo(({
    name,
    type,
    label,
    control,
    errors
}: {
    name: keyof LoginFormValues;
    type: string;
    label: string;
    control: any;
    errors: any;
}) => (
    <motion.div
        className="relative mb-4"
        variants={itemVariants}
    >
        <label htmlFor={name} className="block text-sm font-medium text-white mb-2">
            {label}
        </label>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <input
                    {...field}
                    id={name}
                    type={type}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all duration-200"
                    aria-invalid={errors[name] ? "true" : "false"}
                    data-testid={`input-${name}`}
                />
            )}
        />
        {errors[name] && (
            <p className="text-red-400 text-xs mt-1" data-testid={`error-${name}`}>
                {errors[name]?.message as string}
            </p>
        )}
    </motion.div>
));

InputField.displayName = "InputField";

// Memoized Button component
const SubmitButton = memo(({ isLoading }: { isLoading: boolean }) => (
    <motion.button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-lg text-white focus:outline-none relative overflow-hidden ${isLoading ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-800"
            } transition-colors duration-300 disabled:opacity-70`}
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        variants={itemVariants}
        data-testid="submit-button"
    >
        {isLoading ? (
            <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
            </div>
        ) : (
            "Sign In"
        )}
    </motion.button>
));

SubmitButton.displayName = "SubmitButton";

// Main Auth component
const Auth: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, isLoggedIn, role } = useSelector((state: RootState) => state.auth);
    const [formError, setFormError] = useState<string | null>(null);

    // Setup form with validation
    const {
        control,
        handleSubmit,
        formState: { errors },

    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
        mode: "onBlur",
    });

    // Check for existing session
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");
        const user = localStorage.getItem("user");

        if (token && storedRole && user) {
            try {
                const parsedUser = JSON.parse(user);
                dispatch(loginSuccess({ token, role: storedRole, user: parsedUser }));
                redirectBasedOnRole(storedRole);
            } catch (error) {
                console.error("Error parsing stored user data:", error);
                // Clear invalid data
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user");
            }
        }
    }, [dispatch, navigate]);

    // Redirect if already logged in
    useEffect(() => {
        if (isLoggedIn && role) {
            redirectBasedOnRole(role);
        }
    }, [isLoggedIn, role, navigate]);

    // Handle redirection based on user role
    const redirectBasedOnRole = useCallback((userRole: string) => {
        switch (userRole) {
            case "admin":
                navigate("/admin/dashboard", { replace: true });
                break;
            case "manager":
                navigate("/manager/dashboard", { replace: true });
                break;
            case "employee":
                navigate("/employee/dashboard", { replace: true });
                break;
            default:
                navigate("/login", { replace: true });
        }
    }, [navigate]);

    // Handle login submission
    const handleLogin = useCallback(async (data: LoginFormValues) => {
        setFormError(null);
        dispatch(loginStart());

        try {
            const response = await loginUser(data);

            if (!response?.token || !response?.user || !response?.role) {
                throw new Error("Invalid response format");
            }

            const { token, role, user } = response;

            dispatch(loginSuccess({ token, role, user }));
            toast.success("Login successful! Redirecting...");

            // Redirect based on role
            redirectBasedOnRole(role);

        } catch (error: any) {
            let errorMessage = "Login failed. Please try again.";

            if (error.response?.status === 401) {
                errorMessage = "Invalid email or password";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setFormError(errorMessage);
            toast.error(errorMessage);
            dispatch(loginFailure());

        }
    }, [dispatch, navigate, redirectBasedOnRole]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-900">
            <div className="flex flex-grow items-center justify-center px-6 py-12 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        className="w-full max-w-md"
                        key="login-form"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants}
                    >
                        <motion.div
                            className="bg-indigo-950 rounded-xl shadow-xl overflow-hidden p-8 space-y-8"
                            variants={itemVariants}
                        >
                            <motion.div variants={itemVariants}>
                                <h2 className="text-center text-3xl font-extrabold text-white">
                                    Sign in to your account
                                </h2>
                                <p className="mt-2 text-center text-sm text-gray-400">
                                    Enter your credentials to access your dashboard
                                </p>
                            </motion.div>

                            {formError && (
                                <motion.div
                                    className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    data-testid="form-error"
                                >
                                    {formError}
                                </motion.div>
                            )}

                            <motion.form
                                className="space-y-6"
                                onSubmit={handleSubmit(handleLogin)}
                                variants={itemVariants}
                            >
                                <InputField
                                    name="email"
                                    type="email"
                                    label="Email Address"
                                    control={control}
                                    errors={errors}
                                />

                                <InputField
                                    name="password"
                                    type="password"
                                    label="Password"
                                    control={control}
                                    errors={errors}
                                />

                                <SubmitButton isLoading={isLoading} />
                            </motion.form>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Auth;