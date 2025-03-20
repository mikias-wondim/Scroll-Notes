import AuthForm from "@/components/forms/AuthForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function SignupPage() {
  return (
    <div className="mt-10 flex flex-1 flex-col items-center">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Enter your details to create your account.
          </CardDescription>
        </CardHeader>

        <AuthForm type="signup" />
      </Card>
    </div>
  );
}

export default SignupPage;
