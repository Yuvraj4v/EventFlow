import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventAPI, categoryAPI } from '../../services/api';
import { Spinner } from '../../components/common/UI';
import AdminLayout from './AdminLayout';

export default function EventFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '', description: '', shortDescription: '', coverImage: '',
      status: 'draft', isFeatured: false, isFree: false,
      startDate: '', endDate: '', startTime: '', endTime: '',
      location: { type: 'physical', venue: '', address: '', city: '', state: '', country: '', onlineLink: '', onlinePlatform: '' },
      tickets: [{ name: 'General', price: 0, quantity: 100, description: '', maxPerBooking: 10 }],
      tags: '', category: '', cancellationPolicy: 'moderate'
    }
  });

  const { fields: ticketFields, append: addTicket, remove: removeTicket } = useFieldArray({ control, name: 'tickets' });

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.data));
    if (isEdit) {
      eventAPI.getOne(id).then(r => {
        const e = r.data.data;
        reset({
          ...e,
          category: e.category?._id || e.category,
          startDate: e.startDate?.slice(0, 10),
          endDate: e.endDate?.slice(0, 10),
          tags: e.tags?.join(', ') || ''
        });
      }).catch(() => navigate('/admin/events'));
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      if (isEdit) {
        await eventAPI.update(id, payload);
        toast.success('Event updated!');
      } else {
        await eventAPI.create(payload);
        toast.success('Event created!');
      }
      navigate('/admin/events');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Event' : 'Create New Event'}>
      <button onClick={() => navigate('/admin/events')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Basic Information</h2>
          <div>
            <label className="label">Event Title *</label>
            <input {...register('title', { required: 'Title required' })} placeholder="Amazing Event 2025" className={`input ${errors.title ? 'border-red-400' : ''}`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label">Short Description</label>
            <input {...register('shortDescription')} placeholder="One-line summary (max 200 chars)" className="input" />
          </div>
          <div>
            <label className="label">Full Description *</label>
            <textarea {...register('description', { required: 'Description required' })} rows={5}
              placeholder="Tell attendees what to expect..." className={`input resize-none ${errors.description ? 'border-red-400' : ''}`} />
          </div>
          <div>
            <label className="label">Cover Image URL</label>
            <input {...register('coverImage')} placeholder="https://images.unsplash.com/..." className="input" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select {...register('category', { required: 'Category required' })} className={`input ${errors.category ? 'border-red-400' : ''}`}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input {...register('tags')} placeholder="music, festival, outdoor" className="input" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="rounded accent-primary-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Event</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isFree')} className="rounded accent-primary-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Event</span>
            </label>
          </div>
        </div>

        {/* Date & Time */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Date & Time</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input type="date" {...register('startDate', { required: 'Start date required' })} className={`input ${errors.startDate ? 'border-red-400' : ''}`} />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input type="date" {...register('endDate', { required: 'End date required' })} className="input" />
            </div>
            <div>
              <label className="label">Start Time</label>
              <input type="time" {...register('startTime')} className="input" />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" {...register('endTime')} className="input" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Location</h2>
          <div>
            <label className="label">Event Type</label>
            <select {...register('location.type')} className="input">
              <option value="physical">In-Person</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Venue Name</label>
              <input {...register('location.venue')} placeholder="Madison Square Garden" className="input" />
            </div>
            <div>
              <label className="label">City</label>
              <input {...register('location.city')} placeholder="New York" className="input" />
            </div>
            <div>
              <label className="label">State/Province</label>
              <input {...register('location.state')} placeholder="NY" className="input" />
            </div>
            <div>
              <label className="label">Country</label>
              <input {...register('location.country')} placeholder="USA" className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Full Address</label>
              <input {...register('location.address')} placeholder="123 Main St" className="input" />
            </div>
            <div>
              <label className="label">Online Link (for online/hybrid)</label>
              <input {...register('location.onlineLink')} placeholder="https://zoom.us/..." className="input" />
            </div>
            <div>
              <label className="label">Online Platform</label>
              <input {...register('location.onlinePlatform')} placeholder="Zoom, YouTube, etc." className="input" />
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Tickets</h2>
            <button type="button" onClick={() => addTicket({ name: '', price: 0, quantity: 100, description: '', maxPerBooking: 10 })}
              className="btn-outline text-sm flex items-center gap-1 py-1.5">
              <Plus className="w-4 h-4" /> Add Tier
            </button>
          </div>
          {ticketFields.map((field, i) => (
            <div key={field.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ticket #{i + 1}</span>
                {ticketFields.length > 1 && (
                  <button type="button" onClick={() => removeTicket(i)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Name *</label>
                  <input {...register(`tickets.${i}.name`, { required: true })} placeholder="General / VIP" className="input text-sm py-2" />
                </div>
                <div>
                  <label className="label text-xs">Price ($)</label>
                  <input type="number" min="0" step="0.01" {...register(`tickets.${i}.price`, { valueAsNumber: true })} className="input text-sm py-2" />
                </div>
                <div>
                  <label className="label text-xs">Total Quantity</label>
                  <input type="number" min="1" {...register(`tickets.${i}.quantity`, { valueAsNumber: true })} className="input text-sm py-2" />
                </div>
                <div>
                  <label className="label text-xs">Max Per Booking</label>
                  <input type="number" min="1" {...register(`tickets.${i}.maxPerBooking`, { valueAsNumber: true })} className="input text-sm py-2" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label text-xs">Description</label>
                  <input {...register(`tickets.${i}.description`)} placeholder="What's included?" className="input text-sm py-2" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate('/admin/events')} className="flex-1 btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
            {loading ? <><Spinner size="sm" /> Saving...</> : isEdit ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
