import React from "react";
import {Clock3, Mail, MapPin, Phone} from "lucide-react";
import SectionHeader from "@/features/landing-page/components/SectionHeader";
import {contactData} from "@/features/landing-page/data";

export default function Contact() {
  return (
    <section id="contacts" className="scroll-mt-24 bg-[#f8f4fb] py-16 md:py-24">
      <div className="mx-auto max-w-[100rem] px-6 md:px-9">
        <SectionHeader
          title={contactData.title}
          description={contactData.description}
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[36px] bg-white p-8 shadow-[0_20px_60px_rgba(102,50,135,0.08)] md:p-10">
            <h3 className="text-3xl font-semibold text-[#663287] md:text-[2rem]">
              {contactData.heading}
            </h3>
            <p className="mt-4 max-w-[32rem] text-lg leading-relaxed text-[#616161]">
              {contactData.body}
            </p>

            <div className="mt-8 space-y-4 text-[#2f2f2f]">
              <p className="flex items-center gap-3 rounded-2xl border border-[#efe3f6] bg-[#fcf8ff] p-4 transition-colors">
                <Phone size={18} />
                <span>{contactData.phone}</span>
              </p>

              <p className="flex items-center gap-3 rounded-2xl border border-[#efe3f6] bg-[#fcf8ff] p-4 transition-colors">
                <Mail size={18} />
                <span>{contactData.email}</span>
              </p>

              <div className="flex items-start gap-3 rounded-2xl border border-[#efe3f6] bg-[#fcf8ff] p-4">
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{contactData.address}</p>
                  <p className="mt-1 text-sm text-[#7a7a7a]">
                    {contactData.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#efe3f6] bg-[#fcf8ff] p-4">
                <Clock3 size={18} />
                <span>{contactData.hours}</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[36px] border border-[#efe3f6] bg-white shadow-[0_20px_60px_rgba(102,50,135,0.08)]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d287.3284061529362!2d120.76741987442054!3d14.322186202473544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396290077448657%3A0xcdf378de7fa8a6a4!2sMorena&#39;s%20Dress%20Shop!5e0!3m2!1sen!2sph!4v1782989751986!5m2!1sen!2sph"
              width="100%"
              height="100%"
              className="min-h-[22rem] w-full md:min-h-[28rem]"
              style={{border: 0}}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Morena's Dress Shop location"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
