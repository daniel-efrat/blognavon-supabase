import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Add CORS headers to all responses
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(_name: string, _value: string, _options: CookieOptions) {
        // In Route Handlers, `cookieStore` is read-only.
        // Supabase client might try to set cookies (e.g., on token refresh).
        // This requires middleware or explicit Set-Cookie headers in the response.
        // For now, this is a no-op or you can log the attempt.
        // console.log(`Supabase client tried to set cookie in Route Handler: ${_name}`, { value: _value, options: _options });
      },
      remove(_name: string, _options: CookieOptions) {
        // Similar to set, this is a no-op for the incoming read-only cookie store.
        // console.log(`Supabase client tried to remove cookie in Route Handler: ${_name}`, { options: _options });
      },
    },
  })

  try {

    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      const response = NextResponse.json(
        { error: userError?.message || "אין הרשאה להעלות תמונות. אנא התחבר מחדש." },
        { status: 401 }
      )
      return setCorsHeaders(response)
    }

    console.log("Starting upload process with authenticated user:", {
      userId: user.id,
      email: user.email,
    })

    // Get file data from request
    const formData = await request.formData()
    // Get and validate file data
    const file = formData.get("file") as Blob | null
    const path = formData.get("path") as string

    console.log("Received file data:", {
      hasFile: !!file,
      originalPath: path,
      fileType: file?.type,
      fileSize: file?.size && `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    })

    // Validate and sanitize path
    if (!path) {
      const response = NextResponse.json(
        { error: "לא צוין נתיב לשמירת הקובץ" },
        { status: 400 }
      )
      return setCorsHeaders(response)
    }

    if (!file || !(file instanceof Blob)) {
      const response = NextResponse.json(
        { error: "הקובץ שהתקבל אינו תקין" },
        { status: 400 }
      )
      return setCorsHeaders(response)
    }

    // Validate image content type
    const contentType = file.type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ]
    
    if (!contentType || !allowedTypes.includes(contentType)) {
      const response = NextResponse.json({
        error: `סוג קובץ לא חוקי. הפורמטים המותרים הם: ${
          allowedTypes
            .map(type => type.replace('image/', ''))
            .join(', ')
            .toUpperCase()
        }`,
        allowedTypes
      }, { status: 400 })
      return setCorsHeaders(response)
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      const response = NextResponse.json(
        { error: `גודל הקובץ חורג מהמותר. הגודל המקסימלי הוא ${(maxSize / 1024 / 1024).toFixed(1)}MB` },
        { status: 400 }
      )
      return setCorsHeaders(response)
    }

    // Convert file to buffer and validate format
    console.log("Converting file to buffer...")
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log("File converted to buffer, size:", buffer.length)

    // Ensure path has correct extension based on content type
    const getExtensionFromContentType = (type: string) => {
      switch (type) {
        case 'image/jpeg': return '.jpg'
        case 'image/png': return '.png'
        case 'image/gif': return '.gif'
        case 'image/webp': return '.webp'
        case 'image/svg+xml': return '.svg'
        default: return ''
      }
    }

    // Replace or add correct extension
    const extension = getExtensionFromContentType(contentType)
    const basePath = path.replace(/\.[^/.]+$/, '') // Remove any existing extension
    const finalPath = `${basePath}${extension}`

    console.log("Path validation:", {
      original: path,
      basePath,
      extension,
      final: finalPath
    })

    // Detect actual file type through magic numbers
    const firstChunk = buffer.slice(0, 8) // Get first 8 bytes for extended checks
    
    // Magic number definitions
    const jpegMagic = Buffer.from([0xFF, 0xD8, 0xFF])
    const pngMagic = Buffer.from([0x89, 0x50, 0x4E, 0x47])
    const gifMagic = Buffer.from('GIF8'.split('').map(c => c.charCodeAt(0)))
    const webpMagic = Buffer.from([0x52, 0x49, 0x46, 0x46])
    const svgStart = buffer.slice(0, 100).toString().toLowerCase().includes('<svg')
    
    // Validate file type based on content
    let detectedType = null
    if (firstChunk.slice(0, 3).equals(jpegMagic)) detectedType = 'image/jpeg'
    else if (firstChunk.slice(0, 4).equals(pngMagic)) detectedType = 'image/png'
    else if (firstChunk.slice(0, 4).equals(gifMagic)) detectedType = 'image/gif'
    else if (firstChunk.slice(0, 4).equals(webpMagic)) detectedType = 'image/webp'
    else if (svgStart) detectedType = 'image/svg+xml'

    if (!detectedType || detectedType !== contentType) {
      const response = NextResponse.json({
        error: `סוג הקובץ אינו תואם לפורמט ${contentType.split('/')[1].toUpperCase()}`,
        detectedType,
        providedType: contentType
      }, { status: 400 })
      return setCorsHeaders(response)
    }

    console.log("File type validation passed:", {
      detectedType,
      contentType,
      size: buffer.length
    })

    // Upload to Supabase
    console.log("Starting Supabase upload...")
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(finalPath, buffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: contentType,
      })

    if (uploadError) {
      console.error("Storage upload error:", {
        message: uploadError.message,
        name: uploadError.name,
        error: uploadError,
      })
      const response = NextResponse.json(
        { error: "שגיאה בהעלאת התמונה: " + uploadError.message },
        { status: 500 }
      )
      return setCorsHeaders(response)
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(uploadData.path)

    if (!urlData?.publicUrl) {
      const response = NextResponse.json(
        { error: "לא התקבלה כתובת URL ציבורית לתמונה שהועלתה" },
        { status: 500 }
      )
      return setCorsHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: uploadData.path,
    })

    return setCorsHeaders(response)
  } catch (error) {
    console.error("Error in upload-image route:", error)
    const errorResponse = NextResponse.json(
      { error: "שגיאה בלתי צפויה בהעלאת התמונה" },
      { status: 500 }
    )
    return setCorsHeaders(errorResponse)
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }))
}
