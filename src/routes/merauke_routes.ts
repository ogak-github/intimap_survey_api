import { Router, Request, Response } from "express";
import pool from "./../db";
import Street from "../interface/street";
import { encode } from "@googlemaps/polyline-codec";


const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.redirect("/api/docs");
});

/**
 * @swagger
 * tags:
 *   name: Streets
 *   description: API for streets
 *
 * /getstreets:
 *   get:
 *     summary: Get all streets
 *     tags: [Streets]  # 🔹 This removes the "default" category
 *     description: Retrieve a limited number of streets
 *     responses:
 *       200:
 *         description: A list of streets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Main Street"
 * 
 * /street:
 *   get:
 *     summary: Get streets per page limit 100
 *     tags: [Streets]
 *     description: Retrieve a limited number of streets
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number
 *     responses:
 *       200:
 *         description: A list of streets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Main Street"
 */

router.get("/getstreets", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM street");
    var streets: Street[] = result.rows;
    res.json(streets);
    console.log(streets.length.toString());
  } catch (error) {
    console.error("Error fetching streets", error);
    res.status(500).json({ error: "Error fetching streets" });
  }
});

router.get("/allstreet", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT id, osm_id, nama, truk, pickup, roda3, last_modified_time, meta, ST_AsGeoJSON(geom)::json AS geom FROM street");
    
    // Filter out points
    

    var streets: Street[] = result.rows.filter((row: Street) => {
    
      if (row.geom.type === "Point") {
        return false; // Skip points
      }
      if (row.geom.type === "LineString") {
        row.geom = encode(row.geom.coordinates.map((coord: any) => [coord[1], coord[0]]).reverse()); // Encode LineString coordinates
        return true;
      }
    });
    
    res.json(streets);
    console.log(streets.length.toString());
  
  } catch (error) {
    console.error("Error fetching streets", error);
    res.status(500).json({ error: "Error fetching streets" });
  }
})

router.get("/loadstreets", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT id, osm_id, nama, truk, pickup, roda3, last_modified_time, meta, ST_AsText(geom) AS geom FROM street");
  
    var streets: Street[] = result.rows;
    
    res.json(streets);
    console.log(streets.length.toString());
  
  } catch (error) {
    console.error("Error fetching streets", error);
    res.status(500).json({ error: "Error fetching streets" });
  }
})



router.get("/street", async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * limit;
  try {
    var queryAsGeoJSON = "SELECT id, osm_id, nama, truk, pickup, roda3, last_modified_time, meta, ST_AsGeoJSON(geom)::json AS geom FROM street LIMIT $1 OFFSET $2";
    var simpleQuery = "SELECT * FROM street LIMIT $1 OFFSET $2";
    const result = await pool.query(queryAsGeoJSON, [limit, offset]);  
    
   
    var streets: Street[] = result.rows.filter((row: Street) => {
    
      if (row.geom.type === "Point") {
        return false; // Skip points
      }
      if (row.geom.type === "LineString") {
        row.geom = row.geom;// Encode LineString coordinates
        return true;
      }
    });
    
    const countResult = await pool.query('SELECT COUNT(*) FROM street');
    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);
      
    res.json({
      pages: totalPages,
      currentPage: page,
      data: streets
      } 
        
      );
    } catch (error) {
      console.error("Error fetching streets", error);
      res.status(500).json({ error: "Error fetching streets" });
    }
});


export default router;