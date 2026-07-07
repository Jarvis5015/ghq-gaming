export const announcementAPI = {
  getAll:   ()        => request('/announcements'),
  getAdmin: ()        => request('/announcements/admin'),
  create:   (body)    => request('/announcements',     { method: 'POST',   body: JSON.stringify(body) }),
  update:   (id,body) => request(`/announcements/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),
  delete:   (id)      => request(`/announcements/${id}`, { method: 'DELETE' }),
}
