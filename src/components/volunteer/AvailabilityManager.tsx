import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Trash2, RefreshCw, Video, CheckCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AvailabilityManagerProps {
  upcomingSessions?: any[];
  timeSlots: any[];
  slotDate: string;
  setSlotDate: (date: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  slotsLoading: boolean;
  onAddSlot: (e: React.FormEvent) => void;
  onDeleteSlot: (id: string) => void;
  onMarkCompleted?: (sessionId: string) => void;
}

const formatTimeTo12Hr = (timeString: string) => {
  if (!timeString) return "";
  const parts = timeString.split(":");
  if (parts.length < 2) return timeString;
  let hr = parseInt(parts[0], 10);
  const min = parts[1];
  const ampm = hr >= 12 ? "PM" : "AM";
  hr = hr % 12;
  if (hr === 0) hr = 12;
  return `${hr}:${min} ${ampm}`;
};

export const AvailabilityManager = memo(({ 
  upcomingSessions = [],
  timeSlots, 
  slotDate, 
  setSlotDate, 
  startTime, 
  setStartTime, 
  endTime, 
  setEndTime, 
  slotsLoading,
  onAddSlot,
  onDeleteSlot,
  onMarkCompleted
}: AvailabilityManagerProps) => {

  // Generate 30-min interval options
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr12 = h % 12 === 0 ? 12 : h % 12;
      const label = `${hr12}:${String(m).padStart(2, '0')} ${ampm}`;
      timeOptions.push({ value: timeStr, label });
    }
  }

  // Preview Line Logic
  let previewText = null;
  if (slotDate && startTime && endTime) {
    const startDt = new Date(`${slotDate}T${startTime}`);
    let endDt = new Date(`${slotDate}T${endTime}`);
    
    // Adjust if end time is on the next day (e.g. 11 PM to 1 AM)
    if (endDt <= startDt) {
       endDt = new Date(endDt.getTime() + 24 * 60 * 60 * 1000);
    }
    
    const diffMins = differenceInMinutes(endDt, startDt);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const durationText = hrs > 0 && mins > 0 ? `${hrs} hr ${mins} min` : hrs > 0 ? `${hrs} hr` : `${mins} min`;
    
    const formattedDate = format(parseISO(slotDate), "E d MMM");
    const tStart = formatTimeTo12Hr(startTime);
    const tEnd = formatTimeTo12Hr(endTime);
    
    previewText = `${formattedDate} · ${tStart} – ${tEnd} (${durationText})`;
  }

  const now = new Date();
  const activeOpenSlots = timeSlots.filter(s => {
     if (s.is_booked) return false;
     const slotEnd = new Date(`${s.slot_date}T${s.end_time}`);
     return slotEnd > now;
  }).sort((a,b) => new Date(`${a.slot_date}T${a.start_time}`).getTime() - new Date(`${b.slot_date}T${b.start_time}`).getTime());

  const activeUpcoming = [...upcomingSessions].sort((a,b) => {
    if (!a.time_slots || !b.time_slots) return 0;
    return new Date(`${a.time_slots.slot_date}T${a.time_slots.start_time}`).getTime() - new Date(`${b.time_slots.slot_date}T${b.time_slots.start_time}`).getTime();
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="grid grid-cols-1 xl:grid-cols-3 gap-10"
    >
      {/* Left Card: Add a slot */}
      <Card className="xl:col-span-1 p-8 rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-100/40 flex flex-col">
        <h2 className="text-xl font-display font-black text-[#0D1B2A] mb-8">
          Add a slot
        </h2>
        <form onSubmit={onAddSlot} className="flex-1 flex flex-col">
          <div className="space-y-5">
            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-700">Date</label>
               <Popover>
                 <PopoverTrigger asChild>
                   <Button 
                     variant="outline" 
                     className={cn(
                       "w-full h-12 justify-start text-left font-semibold rounded-xl border-slate-200 hover:bg-slate-50 transition-all",
                       !slotDate && "text-slate-400"
                     )}
                   >
                     <CalendarIcon className="mr-3 h-4 w-4 opacity-50" />
                     {slotDate ? format(parseISO(slotDate), "MMMM d, yyyy") : <span>Select date</span>}
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-slate-100" align="start">
                   <Calendar
                     mode="single"
                     selected={slotDate ? parseISO(slotDate) : undefined}
                     onSelect={(date) => setSlotDate(date ? format(date, "yyyy-MM-dd") : "")}
                     initialFocus
                     disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                     className="p-3"
                   />
                 </PopoverContent>
               </Popover>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-700">Start time</label>
               <Select value={startTime} onValueChange={setStartTime}>
                 <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 font-semibold text-slate-700 focus:ring-[#00C48C]/20">
                   <SelectValue placeholder="Select start time" />
                 </SelectTrigger>
                 <SelectContent className="max-h-[300px] rounded-xl">
                   {timeOptions.map(t => (
                     <SelectItem key={`start-${t.value}`} value={t.value} className="font-medium cursor-pointer">
                       {t.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-700">End time</label>
               <Select value={endTime} onValueChange={setEndTime}>
                 <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 font-semibold text-slate-700 focus:ring-[#00C48C]/20">
                   <SelectValue placeholder="Select end time" />
                 </SelectTrigger>
                 <SelectContent className="max-h-[300px] rounded-xl">
                   {timeOptions.map(t => (
                     <SelectItem key={`end-${t.value}`} value={t.value} className="font-medium cursor-pointer">
                       {t.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
          </div>

          <div className="mt-8 min-h-[40px]">
             <AnimatePresence>
                {previewText && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="text-center px-4 py-2 rounded-xl bg-[#00C48C]/10 text-[#00C48C] font-semibold text-xs"
                   >
                     {previewText}
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
          
          <div className="mt-auto pt-6">
             <Button 
               type="submit" 
               disabled={slotsLoading || !slotDate || !startTime || !endTime}
               className="w-full h-14 rounded-xl bg-[#0D1B2A] text-white font-bold text-sm shadow-xl hover:bg-slate-800 transition-all"
             >
               {slotsLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Add Slot"}
             </Button>
          </div>
        </form>
      </Card>

      {/* Right Card: Your slots */}
      <Card className="xl:col-span-2 p-8 rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-100/40 h-fit">
        <h2 className="text-xl font-display font-black text-[#0D1B2A] mb-8">
          Your slots
        </h2>
        
        <div className="space-y-10">
           {/* UPCOMING SECTION */}
           <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Upcoming</h3>
              
              {activeUpcoming.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
                   <p className="text-sm font-semibold text-slate-500">No sessions booked yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {activeUpcoming.map(session => {
                    if (!session.time_slots) return null;
                    const slot = session.time_slots;
                    
                    const startDt = new Date(`${slot.slot_date}T${slot.start_time}`);
                    let endDt = new Date(`${slot.slot_date}T${slot.end_time}`);
                    if (endDt <= startDt) endDt = new Date(endDt.getTime() + 24 * 60 * 60 * 1000);
                    
                    const diffMins = differenceInMinutes(endDt, startDt);
                    const hrs = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;
                    const duration = hrs > 0 && mins > 0 ? `${hrs}h ${mins}m` : hrs > 0 ? `${hrs}h` : `${mins}m`;
                    
                    return (
                      <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 shadow-sm gap-4 transition-all hover:border-slate-200">
                        <div>
                           <div className="flex items-center gap-2 mb-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-[#0D1B2A] text-white text-[9px] font-black uppercase tracking-widest">Booked</span>
                              <span className="text-sm font-bold text-slate-800">{format(parseISO(slot.slot_date), "MMM d, yyyy")}</span>
                           </div>
                           <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                              <span>{formatTimeTo12Hr(slot.start_time)} – {formatTimeTo12Hr(slot.end_time)}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>{duration}</span>
                           </p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                          <Button 
                             onClick={() => window.open(`https://meet.jit.si/SoulSync-Session-${session.id}`, "_blank")}
                             className="bg-[#00C48C] hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex-1 sm:flex-none"
                          >
                             <Video className="w-4 h-4 mr-2" />
                             Join Session
                          </Button>
                          {onMarkCompleted && (
                             <Button
                               onClick={() => onMarkCompleted(session.id)}
                               className="bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 rounded-xl shadow-sm transition-all h-10 w-10 p-0 shrink-0"
                               title="Mark as completed"
                             >
                               <CheckCircle className="w-4 h-4" />
                             </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
           </div>

           {/* AVAILABLE SECTION */}
           <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Available</h3>
              
              {activeOpenSlots.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
                   <p className="text-sm font-semibold text-slate-500">No slots added yet — add one to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeOpenSlots.map(slot => {
                    const startDt = new Date(`${slot.slot_date}T${slot.start_time}`);
                    let endDt = new Date(`${slot.slot_date}T${slot.end_time}`);
                    if (endDt <= startDt) endDt = new Date(endDt.getTime() + 24 * 60 * 60 * 1000);
                    
                    const diffMins = differenceInMinutes(endDt, startDt);
                    const hrs = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;
                    const duration = hrs > 0 && mins > 0 ? `${hrs}h ${mins}m` : hrs > 0 ? `${hrs}h` : `${mins}m`;
                    
                    return (
                      <div key={slot.id} className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-[#00C48C]/30 hover:shadow-md">
                        <div>
                           <div className="flex items-center gap-2 mb-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-[#00C48C]/10 text-[#00C48C] border border-[#00C48C]/20 text-[9px] font-black uppercase tracking-widest">Open</span>
                              <span className="text-sm font-bold text-slate-800">{format(parseISO(slot.slot_date), "MMM d")}</span>
                           </div>
                           <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                              <span>{formatTimeTo12Hr(slot.start_time)} – {formatTimeTo12Hr(slot.end_time)}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>{duration}</span>
                           </p>
                        </div>
                        <button 
                          onClick={() => onDeleteSlot(slot.id)}
                          className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all md:opacity-0 group-hover:opacity-100 shrink-0 ml-2"
                          title="Delete slot"
                        >
                           <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
           </div>
        </div>
      </Card>
    </motion.div>
  );
});

AvailabilityManager.displayName = "AvailabilityManager";
