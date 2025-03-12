import { Router, Request, Response, query } from "express";
import pool from "./../db";
import Street from "../interface/street";
import { encode } from "@googlemaps/polyline-codec";
import RouteIssue from "../interface/route_issue";


const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Merauke API");
});

/**
 * @swagger
 * tags:
 *   name: Streets
 *   description: API for streets
 *
 * /loadstreets:
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


router.put("/bulk-update", async (req: Request, res: Response) => { 
  const newData: Street[] = req.body;

  if (!Array.isArray(newData) || newData.some(data => !data.id)) {
    res.status(400).send("Invalid input data");
    return;
  }

  console.log(newData);
  try {
    await pool.query('BEGIN');
    for (const data of newData) {
      const query = "UPDATE street SET osm_id = $2, nama = $3, truk = $4, pickup = $5, roda3 = $6, last_modified_time = $7, meta = $8, geom = ST_GeomFromText($9) WHERE id = $1";
      const values = [data.id, data.osm_id, data.nama, data.truk, data.pickup, data.roda3, data.last_modified_time, data.meta, data.geom];
      await pool.query(query, values);
    }

    await pool.query('COMMIT');
    res.status(200).send("Data updated successfully");

  } catch (e) {
    await pool.query('ROLLBACK');
    console.error(e);
    res.status(500).send("Error updating data");
  }
});


router.get("/load-route-issues", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT id, street_id, blocked, notes, ST_AsText(geom) AS geom FROM route_issue");
  
    var routeIssues: RouteIssue[] = result.rows;
      
    res.json(routeIssues);
    console.log("route issues: " + routeIssues.length.toString());
  
  } catch (error) {
    console.error("Error fetching streets", error);
    res.status(500).json({ error: "Error fetching streets" });
  }
})

router.delete("/delete-route-issues/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM route_issue WHERE id = $1", [id]);
    res.status(200).send("Route issues deleted successfully with id " + id);
  } catch (error) {
    console.error("Error deleting route issues with id", id, "error", error);
    res.status(500).json({ error: "Error deleting route issues" });
  }
});
  
router.post("/add-route-issue", async (req: Request, res: Response) => {
  const routeIssues: RouteIssue[] = req.body;
  if (!Array.isArray(routeIssues) || routeIssues.some(data => !data.id)) {
    res.status(400).send("Invalid input data");
    return;
  }

  try {
    await pool.query("BEGIN")
     // Prepare the UPSERT query
     const query = `
     INSERT INTO route_issue (id, street_id, blocked, notes, geom)
     VALUES ($1, $2, $3, $4, ST_GeomFromText($5))
     ON CONFLICT (id) DO UPDATE SET
       street_id = EXCLUDED.street_id,
       blocked = EXCLUDED.blocked,
       notes = EXCLUDED.notes,
       geom = EXCLUDED.geom;
   `;

   // Execute the UPSERT query for each route issue
   for (const issue of routeIssues) {
     await pool.query(query, [
       issue.id,
       issue.street_id,
       issue.blocked,
       issue.notes,
       issue.geom,
     ]);
   }

   // Commit transaction
   await pool.query("COMMIT");
   res.send("Route issues updated successfully");
    
  } catch (err) {
    await pool.query("ROLLBACK")
    console.error(err);
    res.status(500).send("Error on updating route issue");
  }

  
});


export default router;