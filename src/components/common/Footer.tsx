import React from "react";
import Image from "next/image";
import {
  FaHeart,
  FaPhone,
  FaLocationDot,
  FaFacebook,
  FaWhatsapp,
  FaShieldHeart,
  FaEnvelope,
  FaDroplet,
} from "react-icons/fa6";
import { ORG_INFO, EMERGENCY_LEADERS } from "@/lib/data";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: About Organization */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blood-500 bg-white p-0.5">
                <Image
                  src="/logo.png"
                  alt="ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ"
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h4 className="font-bold text-white text-base leading-tight">
                  {ORG_INFO.name}
                </h4>
                <p className="text-xs text-blood-400 font-medium">
                  {ORG_INFO.tagline}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ একটি মানবিক, সামাজিক ও স্বেচ্ছাসেবী সংগঠন। মানবসেবা, রক্তদান এবং অসহায় মানুষের পাশে দাঁড়ানোই আমাদের মূল লক্ষ্য।
            </p>

            <div className="pt-2">
              <p className="text-xs font-semibold text-blood-400 tracking-wide uppercase mb-1">
                আমাদের স্লোগান
              </p>
              <p className="text-sm font-bold text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg inline-block">
                “{ORG_INFO.slogan}”
              </p>
            </div>

            <div className="pt-2">
              <a
                href={ORG_INFO.facebookGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
              >
                <FaFacebook className="text-base flex-shrink-0" />
                <span>অফিসিয়াল ফেসবুক গ্রুপে যোগ দিন</span>
              </a>
            </div>
          </div>

          {/* Col 2: Head Office & Coverage */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-base border-l-4 border-blood-600 pl-3">
              প্রধান কার্যালয় ও বিস্তার
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start space-x-2.5">
                <FaLocationDot className="text-blood-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-white block">
                    প্রধান কার্যালয়:
                  </span>
                  <span>{ORG_INFO.headOffice}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <FaShieldHeart className="text-blood-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-white block">
                    কার্যক্রমের বিস্তৃতি:
                  </span>
                  <span>{ORG_INFO.coverage}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <FaEnvelope className="text-blood-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-white block">ইমেইল:</span>
                  <span>{ORG_INFO.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Emergency Contacts */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-base border-l-4 border-blood-600 pl-3">
              জরুরি প্রয়োজনে যোগাযোগ
            </h4>
            <div className="space-y-3 text-sm">
              {EMERGENCY_LEADERS.map((leader) => (
                <div
                  key={leader.id}
                  className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <p className="font-semibold text-white text-sm">
                    {leader.name}
                  </p>
                  <p className="text-xs text-blood-400">{leader.role}</p>
                  <div className="flex items-center space-x-3 mt-1.5 pt-1.5 border-t border-slate-800 text-xs">
                    <a
                      href={`tel:${leader.phone}`}
                      className="flex items-center space-x-1 text-slate-300 hover:text-white"
                    >
                      <FaPhone className="text-[10px] text-emerald-400" />
                      <span>{leader.phone}</span>
                    </a>
                    {leader.whatsapp && (
                      <a
                        href={`https://wa.me/88${leader.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <FaWhatsapp className="text-xs" />
                        <span>হোয়াটসঅ্যাপ</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 4: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-base border-l-4 border-blood-600 pl-3">
              গুরুত্বপূর্ণ লিঙ্ক
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#donors"
                  className="hover:text-blood-400 transition-colors flex items-center space-x-2"
                >
                  <FaDroplet className="text-xs text-blood-500" />
                  <span>রক্তদাতা অনুসন্ধান</span>
                </a>
              </li>
              <li>
                <a
                  href="#requests"
                  className="hover:text-blood-400 transition-colors flex items-center space-x-2"
                >
                  <FaDroplet className="text-xs text-blood-500" />
                  <span>জরুরি রক্তের আবেদন তালিকা</span>
                </a>
              </li>
              <li>
                <a
                  href="#members"
                  className="hover:text-blood-400 transition-colors flex items-center space-x-2"
                >
                  <FaDroplet className="text-xs text-blood-500" />
                  <span>আমাদের সদস্যবৃন্দ ও পরিচালনা কমিটি</span>
                </a>
              </li>
              <li>
                <a
                  href="#activities"
                  className="hover:text-blood-400 transition-colors flex items-center space-x-2"
                >
                  <FaDroplet className="text-xs text-blood-500" />
                  <span>আমাদের মানবিক কার্যক্রমসমূহ</span>
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="hover:text-blood-400 transition-colors flex items-center space-x-2"
                >
                  <FaDroplet className="text-xs text-blood-500" />
                  <span>আমাদের লক্ষ্য, উদ্দেশ্য ও অঙ্গীকার</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} {ORG_INFO.name}। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="flex items-center space-x-1">
            <span>মানবতার কল্যাণে স্বেচ্ছাসেবী উদ্যোগে পরিচালিত</span>
            <FaHeart className="text-blood-500 text-xs inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
