import { useEffect, useState } from 'react'
import { db } from '../firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { useNetworkStatus } from '../context/useNetworkStatus'

const EMPTY_FORM = { name: '', price: '', description: '', available: true }

function MenuManagementPage() {
  const [snacks, setSnacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const isOnline = useNetworkStatus()

  async function fetchSnacks() {
    const snapshot = await getDocs(collection(db, 'snacks'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setSnacks(data)
    setLoading(false)
  }

  useEffect(() => { fetchSnacks() }, [])

  function handleChange(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: value }))
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleEdit(snack) {
    setEditingId(snack.id)
    setForm({
      name: snack.name,
      price: snack.price,
      description: snack.description,
      available: snack.available
    })
    setImagePreview(snack.imageUrl || null)
    setImageFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    setUploadProgress(0)
  }

  async function uploadImage(file) {
    const cloudName = 'dnwwt9jrz'      // replace with your cloud name
    const uploadPreset = 'snacks_upload'  // replace with your preset name

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    // Simulate progress since fetch doesn't support progress events
    setUploadProgress(30)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    )

    setUploadProgress(90)
    const data = await response.json()

    if (!data.secure_url) throw new Error('Image upload failed')
    setUploadProgress(100)
    return data.secure_url
  }

  async function handleSave() {
  if (!form.name || !form.price || !form.description) {
    showToast('Please fill in all fields', 'warning')
    return
  }

  if (!isOnline) {
    showToast('No internet connection. Please check your network.', 'error')
    return
  }

  setSaving(true)
  setUploadProgress(0)

  try {
    const data = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      available: form.available
    }

    if (editingId) {
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile)
        data.imageUrl = imageUrl
      }
      await updateDoc(doc(db, 'snacks', editingId), data)
      showToast('Snack updated successfully!', 'success')
    } else {
      const docRef = await addDoc(collection(db, 'snacks'), data)
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile)
        await updateDoc(doc(db, 'snacks', docRef.id), { imageUrl })
      }
      showToast('Snack added successfully!', 'success')
    }

    handleCancel()
    await fetchSnacks()
  } catch (error) {
    console.error(error)
    showToast('Something went wrong. Please try again.', 'error')
  }

  setSaving(false)
}

  async function handleDelete(snack) {
  if (!window.confirm('Are you sure you want to delete this snack?')) return
  try {
    await deleteDoc(doc(db, 'snacks', snack.id))
    showToast('Snack deleted.', 'info')
    await fetchSnacks()
  } catch (error) {
    showToast('Failed to delete snack. Please try again.', 'error')
  }
}

  async function toggleAvailability(snack) {
    await updateDoc(doc(db, 'snacks', snack.id), { available: !snack.available })
    await fetchSnacks()
  }

  async function handleDeleteImage(snack) {
    if (!window.confirm('Remove this image?')) return
    await updateDoc(doc(db, 'snacks', snack.id), { imageUrl: null })
    await fetchSnacks()
    if (editingId === snack.id) setImagePreview(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-500 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-2xl p-1">←</button>
          <h1 className="text-xl font-bold">Menu Management</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-6">
        {/* Add / Edit Form */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
          <h2 className="font-bold text-gray-700 text-lg">
            {editingId ? '✏️ Edit Snack' : '➕ Add New Snack'}
          </h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500 font-medium">Snack Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Puff Puff"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500 font-medium">Price (₦) *</label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              type="number"
              placeholder="e.g. 500"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500 font-medium">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Soft and fluffy deep fried dough"
              rows={2}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-500 font-medium">Snack Image</label>
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition">
                <span className="text-3xl">📷</span>
                <span className="text-sm text-gray-400 mt-1">Tap to upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Upload Progress */}
            {saving && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="available"
              id="available"
              checked={form.available}
              onChange={handleChange}
              className="w-4 h-4 accent-orange-500"
            />
            <label htmlFor="available" className="text-sm text-gray-600">Available on menu</label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {saving
                ? `Saving... ${uploadProgress > 0 && uploadProgress < 100 ? uploadProgress + '%' : ''}`
                : editingId ? 'Update Snack' : 'Add Snack'}
            </button>
            {editingId && (
              <button
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Snack List */}
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-gray-700 text-lg">
            Current Menu ({snacks.length} items)
          </h2>

          {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : snacks.length === 0 ? (
            <p className="text-center text-gray-400">No snacks yet. Add one above!</p>
          ) : (
            snacks.map(snack => (
              <div key={snack.id} className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 flex items-start gap-3">
                {/* Image */}
                <div className="relative flex-shrink-0">
                  {snack.imageUrl ? (
                    <div className="relative">
                      <img
                        src={snack.imageUrl}
                        alt={snack.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <button
                        onClick={() => handleDeleteImage(snack)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                      🍿
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{snack.name}</p>
                  <p className="text-orange-500 font-semibold text-sm">₦{snack.price}</p>
                  <p className="text-gray-400 text-xs truncate">{snack.description}</p>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAvailability(snack)}
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
                      snack.available
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {snack.available ? 'Available' : 'Hidden'}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(snack)}
                      className="text-xs bg-orange-50 text-orange-500 px-3 py-1 rounded-full font-semibold hover:bg-orange-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(snack)}
                      className="text-xs bg-red-50 text-red-400 px-3 py-1 rounded-full font-semibold hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default MenuManagementPage