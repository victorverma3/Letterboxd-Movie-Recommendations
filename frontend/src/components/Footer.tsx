import emaillogo from "../images/emaillogo.png";
import linkedinlogo from "../images/linkedinlogo.png";
import githublogo from "../images/githublogo.png";
import letterboxdlogo from "../images/letterboxdlogo.png";

const Footer = () => {
    return (
        <div>
            <hr />
            <p className="w-fit mx-auto mt-2 mb-2 text-center text-xs">
                Created by{" "}
                <a
                    className="underline hover:decoration-amber-800 hover:shadow-md"
                    href="https://www.victorverma.com/"
                    target="_blank"
                >
                    Victor Verma
                </a>
            </p>
            <div className="w-32 mx-auto flex flex-row justify-around">
                <a href="mailto:victor.verma@hotmail.com" target="_blank">
                    <img className="w-6" src={emaillogo} alt="Email Logo"></img>
                </a>
                <a
                    href="https://www.linkedin.com/in/victorverma"
                    target="_blank"
                >
                    <img
                        className="w-6"
                        src={linkedinlogo}
                        alt="LinkedIn Logo"
                    ></img>
                </a>
                <a href="https://github.com/victorverma3" target="_blank">
                    <img
                        className="w-6"
                        src={githublogo}
                        alt="GitHub Logo"
                    ></img>
                </a>
                <a href="https://letterboxd.com/victorverma" target="_blank">
                    <img
                        className="w-6"
                        src={letterboxdlogo}
                        alt="Letterboxd Logo"
                    ></img>
                </a>
            </div>
            <p className="w-4/5 sm:min-w-96 mx-auto mt-2 mb-2 text-center text-xs">
                Leave suggestions or feedback{" "}
                <a
                    className="underline hover:decoration-amber-800 hover:shadow-md"
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdRETeDzFE_i6lSv6BunfmSHCdINK5YQKoFAV_8nwog1-A9Qg/viewform?usp=sf_link"
                    target="_blank"
                >
                    here
                </a>
            </p>
            <p className="w-4/5 sm:min-w-96 mx-auto mt-2 mb-2 text-center text-xs">
                Consider donating{" "}
                <a
                    className="underline hover:decoration-amber-800 hover:shadow-md"
                    href="https://ko-fi.com/victorverma"
                    target="_blank"
                >
                    here
                </a>{" "}
                to help with server and database costs!
            </p>
            <p className="w-4/5 sm:min-w-96 mx-auto mt-2 mb-4 text-center text-xs">
                *This project uses publicly accessible data and is not
                affiliated with Letterboxd in any way
            </p>
        </div>
    );
};

export default Footer;
