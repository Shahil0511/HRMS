import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../services/authServices";
import { RootState } from "../store/store";

// Define Types for Login and Signup Data
interface LoginData {
    email: string;
    password: string;
}

interface SignupData extends LoginData {
    name: string;
    confirmPassword: string;
}

// Validation Schema using Zod
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema
    .extend({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name cannot exceed 50 characters")
            .trim(),
        confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords must match",
    });

const InputField: React.FC<{
    name: string;
    type: string;
    label: string;
    control: any;
    errors: any;
}> = ({ name, type, label, control, errors }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-white">
            {label}
        </label>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <input
                    id={name}
                    {...field}
                    type={type}
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            )}
        />
        {errors[name] && (
            <p className="text-red-500 text-sm">{errors[name]?.message}</p>
        )}
    </div>
);

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state: RootState) => state.auth);

    // Form initialization with react-hook-form and Zod validation
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(isLogin ? loginSchema : signupSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            name: "",
        },
    });

    // Check if the user is already logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/employee/dashboard", { replace: true });
        }
    }, [navigate]);

    // Reset form when toggling between login/signup
    useEffect(() => {
        reset();
    }, [isLogin, reset]);

    const toggleForm = () => setIsLogin(!isLogin);

    const onSubmit = async (data: LoginData | SignupData) => {
        dispatch(loginStart()); // Set loading to true
        try {
            let response;

            if (isLogin) {
                const loginData: LoginData = { email: data.email, password: data.password };
                response = await loginUser(loginData);
            } else {
                const signupData: SignupData = {
                    name: (data as SignupData).name,
                    email: data.email,
                    password: data.password,
                    confirmPassword: (data as SignupData).confirmPassword,
                };
                response = await signupUser(signupData);
            }

            if (isLogin) {
                const { token, role, user } = response.data;

                // Handle successful login
                toast.success("Login successful!", { position: "top-right", autoClose: 3000 });
                localStorage.setItem("token", token);

                dispatch(loginSuccess({ token, user, role })); // Update Redux state

                // Redirect based on role
                if (role === "admin") {
                    navigate("/admin/dashboard", { replace: true });
                } else {
                    navigate("/employee/dashboard", { replace: true });
                }
            } else {
                // Handle successful signup
                toast.success("Signup successful! You can now log in.", { position: "top-right", autoClose: 3000 });
                reset(); // Reset form fields
                setIsLogin(true); // Switch to login form
            }
        } catch (error: any) {
            // Handle errors
            const message = error.response?.data?.message || (isLogin ? "Login failed." : "Signup failed.");
            toast.error(message, { position: "top-right", autoClose: 5000 });
            dispatch(loginFailure()); // Reset isLoading state
        } finally {
            dispatch(loginFailure()); // Ensure loading state is reset in case of any error
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-r from-gray-900 to-indigo-900 text-white">
            <div className="flex-grow flex justify-center items-center py-6 px-4 md:px-8">
                <div className="bg-gradient-to-l from-gray-900 to-indigo-900 text-white shadow-lg p-8 rounded-lg max-w-lg w-full overflow-hidden">
                    <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? "Login" : "Sign Up"}</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Name Field */}
                            {!isLogin && <InputField name="name" type="text" label="Name" control={control} errors={errors} />}

                            {/* Email Field */}
                            <InputField name="email" type="email" label="Email" control={control} errors={errors} />

                            {/* Password Field */}
                            <InputField name="password" type="password" label="Password" control={control} errors={errors} />

                            {/* Confirm Password Field */}
                            {!isLogin && (
                                <InputField name="confirmPassword" type="password" label="Confirm Password" control={control} errors={errors} />
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="mb-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-2 rounded-lg ${isLoading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
                                    } text-white focus:outline-none`}
                            >
                                {isLoading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                            </button>
                        </div>

                        {/* Toggle Between Forms */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={toggleForm}
                                className="text-blue-500 hover:underline"
                            >
                                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Auth;
