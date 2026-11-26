import { supabase } from "@/lib/supabase";
import { normalizeListing } from "@/api/client";

function must({ data, error }) {
  if (error) throw error;
  return data;
}

// ---------- photos -------------------------------------------------

async function compressImage(file, maxSide = 1600, quality = 0.8) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    return blob || file;
  } catch {
    return file;
  }
}

// Shrinks each photo (saves mobile data) and uploads it to the user's own
// folder. Returns the public URLs.
export async function uploadListingImages(files, uid) {
  const urls = [];
  for (const file of files) {
    const blob = await compressImage(file);
    const type = blob.type || "image/jpeg";
    const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    const path = `${uid}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("listing-images")
      .upload(path, blob, { contentType: type, cacheControl: "31536000" });
    if (error) throw error;
    urls.push(supabase.storage.from("listing-images").getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

// ---------- profile ------------------------------------------------

export async function updateProfile(uid, patch) {
  must(await supabase.from("profiles").update(patch).eq("id", uid));
}

// ---------- listings (landlord + broker) ---------------------------

export async function createListing({ listing, priv, asBroker, uid }) {
  const row = {
    ...listing,
    landlord_id: asBroker ? null : uid,
    created_by: uid,
    status: asBroker ? "approved" : "pending",
  };
  const created = must(await supabase.from("listings").insert(row).select().single());
  must(await supabase.from("listing_private").insert({ listing_id: created.id, ...priv }));
  return created;
}

export async function getMyListings(uid) {
  const data = must(
    await supabase
      .from("listings")
      .select("*")
      .eq("landlord_id", uid)
      .order("created_at", { ascending: false })
  );
  return data.map(normalizeListing);
}

export async function deleteListing(id) {
  must(await supabase.from("listings").delete().eq("id", id));
}

// ---------- tenant requests ----------------------------------------

export async function getMyRequests(uid) {
  return must(
    await supabase
      .from("requests")
      .select("*")
      .eq("tenant_id", uid)
      .order("created_at", { ascending: false })
  );
}

export async function getMyRequestForListing(listingId, uid) {
  return must(
    await supabase
      .from("requests")
      .select("*")
      .eq("listing_id", listingId)
      .eq("tenant_id", uid)
      .maybeSingle()
  );
}

export async function createRequest({ listing, uid, name, phone, message, preferred_date }) {
  return must(
    await supabase
      .from("requests")
      .insert({
        listing_id: listing.id,
        listing_title: listing.title,
        tenant_id: uid,
        tenant_name: name || null,
        tenant_phone: phone || null,
        message: message || null,
        preferred_date: preferred_date || null,
      })
      .select()
      .single()
  );
}

export async function cancelRequest(id) {
  must(await supabase.from("requests").delete().eq("id", id));
}

export async function getMyLinks(uid) {
  return must(
    await supabase
      .from("links")
      .select("*")
      .or(`tenant_id.eq.${uid},landlord_id.eq.${uid}`)
      .order("created_at", { ascending: false })
  );
}

// ---------- broker -------------------------------------------------

export async function getAllRequests() {
  return must(
    await supabase.from("requests").select("*").order("created_at", { ascending: false })
  );
}

export async function updateRequest(id, patch) {
  must(await supabase.from("requests").update(patch).eq("id", id));
}

export async function getAllListings() {
  const data = must(
    await supabase.from("listings").select("*").order("created_at", { ascending: false })
  );
  return data.map(normalizeListing);
}

export async function getPrivateMap() {
  const data = must(await supabase.from("listing_private").select("*"));
  return Object.fromEntries(data.map((r) => [r.listing_id, r]));
}

export async function setListingStatus(id, status) {
  must(await supabase.from("listings").update({ status }).eq("id", id));
}

export async function getAllLinks() {
  return must(
    await supabase.from("links").select("*").order("created_at", { ascending: false })
  );
}

// Copies both sides' contact details into a link row and marks the request linked.
export async function linkTenantToLandlord({ request, listing, priv }) {
  const link = must(
    await supabase
      .from("links")
      .insert({
        request_id: request.id,
        listing_id: request.listing_id,
        listing_title: request.listing_title || listing?.title || null,
        tenant_id: request.tenant_id,
        landlord_id: listing?.landlord_id || null,
        tenant_name: request.tenant_name,
        tenant_phone: request.tenant_phone,
        landlord_name: priv?.contact_name || null,
        landlord_phone: priv?.contact_phone || null,
        address: priv?.address || null,
      })
      .select()
      .single()
  );
  await updateRequest(request.id, { status: "linked" });
  return link;
}

export async function getInquiries() {
  return must(
    await supabase.from("inquiries").select("*").order("created_at", { ascending: false })
  );
}

export async function updateInquiry(id, patch) {
  must(await supabase.from("inquiries").update(patch).eq("id", id));
}

export async function deleteInquiry(id) {
  must(await supabase.from("inquiries").delete().eq("id", id));
}

// ---------- Cash flow ----------
export async function getTransactions() {
  return must(
    await supabase.from("transactions").select("*").order("occurred_at", { ascending: false })
  );
}

export async function addTransaction({ kind, amount, category, note, method, reference, uid }) {
  must(
    await supabase.from("transactions").insert({
      kind,
      amount,
      category: category || null,
      note: note || null,
      method: method || null,
      reference: reference || null,
      created_by: uid,
    })
  );
}

export async function deleteTransaction(id) {
  must(await supabase.from("transactions").delete().eq("id", id));
}

export async function getCashflowViewers() {
  return must(await supabase.from("cashflow_viewers").select("*").order("added_at"));
}

export async function addCashflowViewer(email) {
  must(await supabase.from("cashflow_viewers").insert({ email: email.trim().toLowerCase() }));
}

export async function removeCashflowViewer(email) {
  must(await supabase.from("cashflow_viewers").delete().eq("email", email));
}

export async function amCashflowViewer(email) {
  if (!email) return false;
  const { data } = await supabase
    .from("cashflow_viewers")
    .select("email")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return !!data;
}
