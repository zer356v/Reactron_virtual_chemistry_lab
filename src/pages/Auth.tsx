  import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '@/hooks/useAuth';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { useToast } from '@/hooks/use-toast';
  import logo from '../assets/logo3.png';
  import BG_IMAGE from "../assets/BG_IMAGE2.jpg"
  import AnimatedGradient from "../assets/AnimatedGradient.gif"

  const Auth = () => {

    const navigate = useNavigate();
    const { signIn, signUp, user, signInWithGoogle } = useAuth();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("login"); // ★ IMPORTANT — UI SWITCH

    if (user) { navigate('/lab'); return null; }

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [signupForm, setSignupForm] = useState({ fullName:'', email:'', password:'' });


    // LOGIN
    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await signIn(loginForm.email, loginForm.password);
        toast({ title: 'Welcome back!' });
        navigate('/lab');
      } catch (error) {
        toast({ title:"Login Failed", description:error.message, variant:"destructive"});
      }
      setLoading(false);
    };


    // SIGNUP
    const handleSignup = async (e) => {
      e.preventDefault();
      setLoading(true);
      if(signupForm.password.length < 6){
        toast({title:"Error",description:"Password must be 6+ characters",variant:"destructive"});
        return setLoading(false);
      }
      try {
        await signUp(signupForm.email, signupForm.password, signupForm.fullName);
        toast({title:"Account Created!"});
        navigate('/lab');
      } catch(error){
        toast({title:"Signup Failed",description:error.message,variant:"destructive"});
      }
      setLoading(false);
    };


    // GOOGLE LOGIN
    const googleLogin = async () => {
      setLoading(true);
      try {
        await signInWithGoogle();
        navigate('/lab');
      } catch(e){
        toast({title:"Google Auth Failed",variant:"destructive"});
      }
      setLoading(false);
    };

    // ---------------- UI RETURN -----------------
   return (
  <div className="w-full min-h-screen flex items-center justify-center relative text-white overflow-hidden">
    <img 
      src={AnimatedGradient}
      className="absolute inset-0 w-full h-full object-cover"
      alt="bg"
    />

    {/* MAIN WRAPPER – Responsive */}
    <div className="
      relative w-[90%] max-w-[1100px]
      md:h-[75vh]
      rounded-[25px] backdrop-blur-3xl bg-white/10 border border-white/20 shadow-2xl
      flex flex-col md:flex-row
      p-6 md:p-0
    ">

      {/* LEFT SECTION */}
      <div className="
        w-full md:w-1/2 flex flex-col justify-center 
        px-4 md:pl-16 text-center md:text-left
      ">
        <img alt='logo' src={logo} className="w-32 md:w-40 mx-auto md:mx-0 mb-5 drop-shadow-md" />

        <h1 className="text-3xl md:text-4xl font-bold uppercase leading-tight">
          Virtual Chemistry Lab
        </h1>
        <h1 className="text-3xl md:text-4xl font-bold uppercase text-white/90 leading-tight mb-3">
          Where Science Meets Reality
        </h1>

        <p className="text-white/80 text-sm md:text-base max-w-sm mx-auto md:mx-0">
          Run real-time chemical experiments, visualize reactions, analyze compounds,
          and simulate lab results — all inside your browser.
        </p>

        <p className="text-white/60 text-xs mt-6 italic hidden md:block">
          AI Powered • Lab Precision • Student Friendly • Real-Time Reactions
        </p>
      </div>

      {/* RIGHT AUTH CARD */}
      <div className="w-full md:w-1/2 flex justify-center items-center mt-8 md:mt-0">
        <div className="w-full max-w-[360px] border-white/30 rounded-2xl p-8">

          <h2 className="text-sm font-semibold text-center">
            {mode === "login" ? "WELCOME BACK EXCLUSIVE MEMBER" : "CREATE YOUR ACCOUNT"}
          </h2>
          <p className="text-center text-white/60 text-xs mt-1">
            {mode === "login" ? "LOGIN TO CONTINUE" : "SIGNUP TO CONTINUE"}
          </p>

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="mt-6 space-y-3">
              <Input placeholder="Example@gmail.com"
                className="bg-white text-black"
                value={loginForm.email}
                onChange={e=>setLoginForm({...loginForm,email:e.target.value})}
                required
              />
              <Input placeholder="Password" type="password"
                className="bg-white text-black"
                value={loginForm.password}
                onChange={e=>setLoginForm({...loginForm,password:e.target.value})}
                required
              />

              <Button type="submit" className="w-full bg-black text-white hover:bg-white hover:text-black">
                Proceed to my Account
              </Button>

              <p className="text-center text-xs text-white/60">or login using</p>

              <Button
                onClick={googleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-black 
                          hover:bg-black hover:text-white duration-200"
              >
                <img src="./public/google-icon.svg" alt="google" className="w-5 h-5" /> {/* your icon */}
                Sign in with Google
              </Button>


              <p onClick={()=>setMode("signup")} className="text-center text-[11px] mt-2 underline cursor-pointer">
                Don't have an account? Register Now
              </p>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="mt-6 space-y-3">
              <Input placeholder="Full Name" className="bg-white text-black"
                value={signupForm.fullName}
                onChange={e=>setSignupForm({...signupForm,fullName:e.target.value})}
                required
              />
              <Input placeholder="Email" className="bg-white text-black"
                value={signupForm.email}
                onChange={e=>setSignupForm({...signupForm,email:e.target.value})}
                required
              />
              <Input placeholder="Password" type="password" className="bg-white text-black"
                value={signupForm.password}
                onChange={e=>setSignupForm({...signupForm,password:e.target.value})}
                required
              />

              <Button type="submit" className="w-full bg-black hover:bg-white hover:text-black">
                Create Account
              </Button>

              <p className="text-center text-xs text-white/60">or register using</p>
              <Button
                onClick={googleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-black hover:text-white duration-200"
              >
                <img src="./public/google-icon.svg" alt="google" className="w-5 h-5" /> {/* your icon */}
                Sign in with Google
              </Button>

              <p onClick={()=>setMode("login")} className="text-center text-[11px] mt-2 underline cursor-pointer">
                Already a member? Login Now
              </p>
            </form>
          )}
        </div>
      </div>

    </div>
  </div>
);

  };

  export default Auth;
