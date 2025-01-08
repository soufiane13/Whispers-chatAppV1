import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useSignup = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const signup = async ({ fullName, username, pwd, confirmpwd, gender }) => {
		const success = handleInputErrors({ fullName, username, pwd, confirmpwd, gender });
		if (!success) return;

		setLoading(true);
		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ fullName, username, pwd, confirmpwd, gender }),
			});

			const data = await res.json();
			if (data.error) {
				throw new Error(data.error);
			}
			localStorage.setItem("chat-user", JSON.stringify(data));
			setAuthUser(data);
		} catch (error) {
			toast.error(error.msg);
		} finally {
			setLoading(false);
		}
	};

	return { loading, signup };
};
export default useSignup;

function handleInputErrors({ fullName, username, pwd, confirmpwd, gender }) {
	if (!fullName || !username || !pwd || !confirmpwd || !gender) {
		toast.error("Please fill in all fields");
		return false;
	}

	if (pwd !== confirmpwd) {
		toast.error("Passwords do not match");
		return false;
	}

	if (pwd.length < 6) {
		toast.error("Password must be at least 6 characters");
		return false;
	}

	return true;
}
